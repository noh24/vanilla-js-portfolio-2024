import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import livereload from 'livereload'

const __fileName = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__fileName)
const mimeTypes = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
}
const PORT = 3000

const readFileWithLiveReload = (filePath, contentType, callBack) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return callBack(err)
        }

        if (contentType === 'text/html' && process.env.NODE_ENV === 'development ') {
            data = data.toString().replace(
                '</body>',
                `<script src="http://localhost:35729/livereload.js"></script></body>`
            )
            return callBack(null, data)
        }

        return callBack(null, data)
    })
}

const serveStaticFiles = (req, res, next) => {
    const urlNormalized = req.url === '/' ? '/index.html' : req.url
    const ext = path.extname(urlNormalized)
    const contentType = mimeTypes[ext] ?? 'text/plain'
    const directory = ext != '.ico' ? 'src' : ''
    const filePath = path.join(__dirname, directory, urlNormalized)

    readFileWithLiveReload(filePath, contentType, (err, data) => {
        if (err) {
            return next(err)
        }
        res.writeHead(200, { "content-type": contentType })
        res.end(data)
    })
}

const handleError = (req, res) => {
    const indexPath = path.join(__dirname, 'src', 'index.html')

    readFileWithLiveReload(indexPath, 'text/html', (err, content) => {
        if (err) {
            res.writeHead(500, { "content-type": "text/plain" })
            return res.end("Internal Server Error")
        }
        res.writeHead(301, { Location: '/', "content-type": 'text/html' })
        res.end(content)
    }) 
}

const server = http.createServer((req, res) => {
    serveStaticFiles(req, res, (err) => {
        if (err) {
            handleError(req, res)
        }
    })
})

server.listen(3000, () => {
    console.log(`Server is listening: http://localhost:${PORT}`)
})

if (process.env.NODE_ENV === 'development ') {
    const liveReloadServer = livereload.createServer({
        exts: ['html', 'js', 'css'],
        debug: true
    })

    const watchDirectory = path.join(__dirname, 'src')

    liveReloadServer.watch(watchDirectory)

    let timer
    fs.watch(watchDirectory, { recursive: true }, (eventType, fileName) => {
        if (fileName) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                console.log(`File changed: ${fileName}`)
                liveReloadServer.refresh('*')
            }, 100)
        }
    })
}