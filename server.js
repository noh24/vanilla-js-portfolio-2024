import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import livereload from 'livereload'

const MIME_TYPES = {
	'.ico': { contentType: 'image/x-icon', directory: '' },
	'.html': { contentType: 'text/html', directory: 'src' },
	'.js': { contentType: 'text/javascript', directory: 'src' },
	'.css': { contentType: 'text/css', directory: 'src' },
	'.ttf': { contentType: 'font/ttf', directory: '' },
	'.svg': { contentType: 'image/svg+xml', directory: '' },
}
const PORT = 3000
const IS_DEV = process.env.NODE_ENV.trim() === 'development'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

class StaticFileServer {
	constructor(port) {
		this.port = port
		this.server = http.createServer(this.handleRequest.bind(this))
	}

	async readFile(filePath) {
		return fs.promises.readFile(filePath)
	}

	injectLiveReload(html) {
		return html.toString().replace(
			'</body>',
			`<script src="http://localhost:35729/livereload.js"></script></body>`,
		)
	}

	async serveFile(req, res) {
		const urlPath = req.url === '/' ? '/index.html' : req.url
		const ext = path.extname(urlPath)
		const mimeInfo = MIME_TYPES[ext] || { contentType: 'text/plain', directory: '' }
		const filePath = path.join(__dirname, mimeInfo.directory, urlPath)

		try {
			let data = await this.readFile(filePath)

			if (mimeInfo.contentType === 'text/html' && IS_DEV) {
				data = this.injectLiveReload(data)
			}

			res.writeHead(200, { 'content-type': mimeInfo.contentType })
			res.end(data)
		} catch (err) {
			throw err
		}
	}

	async handleError(res) {
		try {
			const data = await this.readFile(path.join(__dirname, 'src', 'index.html'))
			res.writeHead(301, { Location: '/', 'content-type': 'text/html' })
			res.end(data)
		} catch (err) {
			res.writeHead(500, { 'content-type': 'text/plain' })
			res.end('Internal Server Error')
		}
	}

	async handleRequest(req, res) {
		try {
			await this.serveFile(req, res)
		} catch (err) {
			await this.handleError(res)
		}
	}

	setupLiveReload() {
		if (!IS_DEV) return

		const liveReloadServer = livereload.createServer({
			exts: ['html', 'js', 'css'],
		})

		liveReloadServer.watch(path.join(__dirname, 'src'))

		let debounceTimer
		fs.watch(path.join(__dirname, 'src'), { recursive: true }, (_, fileName) => {
			if (fileName) {
				clearTimeout(debounceTimer)
				debounceTimer = setTimeout(() => {
					console.log(`File changed: ${fileName}`)
					liveReloadServer.refresh('*')
				}, 300)
			}
		})
	}

	start() {
		this.server.listen(this.port, () => {
			console.log(`Server is listening: http://localhost:${this.port}`)
		})
		this.setupLiveReload()
	}
}

const server = new StaticFileServer(PORT)
server.start()