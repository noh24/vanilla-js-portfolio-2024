import http from 'http'
import fs from 'fs'
import path, { dirname } from 'path'
import livereload from 'livereload'
import { fileURLToPath }  from 'url'

const PORT = 3000
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function serveStaticFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' })
                res.end('<h1>404 Not Found</h1>', 'utf-8')
            } else {
                res.writeHead(500)
                res.end(`Server Error: ${err.code}`)
            }
        } else {
            if (
                contentType == 'text/html' &&
                process.env.NODE_ENV == 'development '
            ) {
                content = content.toString()
                content = content.replace(
                    '</body>',
                    `<script src="http://localhost:35729/livereload.js"></script></body>`,
                )
            }

            res.writeHead(200, { 'Content-Type': contentType })
            res.end(content, 'utf-8')
        }
    })
}

const server = http.createServer((req, res) => {
    const basePath = path.join(__dirname, 'src')

    const pathTypes = {
        '/': 'index.html',
        '/index.css': 'index.css',
        '/index.js': 'index.js',
        '/about': '/about/about.html',
        '/projects': '/projects/projects.html',
        '/contact': '/contact/contact.html',
    }

    const filePath = path.join(basePath, pathTypes[req.url] ?? 'index.html')

    const extname = path.extname(filePath).toLowerCase()
    let mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    }

    const contentType = mimeTypes[extname] || 'application/octet-stream'

    serveStaticFile(filePath, contentType, res)
})

server.listen(PORT, () => {
    console.log(`${process.env.NODE_ENV}: Server running at http://localhost:${PORT}`)
})

if (process.env.NODE_ENV === 'development ') {
    const liveReloadServer = livereload.createServer()
    liveReloadServer.watch(path.join(__dirname, 'src'))

    const watchDirectory = path.join(__dirname, 'src')
    let timer
    fs.watch(watchDirectory, { recursive: true }, (eventType, fileName) => {
        if (fileName) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                console.log(`File changed: ${fileName}`)
                liveReloadServer.refresh('*')
            }, 300)
        }
    })
}
