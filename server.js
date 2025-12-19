// Cargar variables de entorno
require('dotenv').config();

const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const body_parser = require('body-parser')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const config = require('./src/config/config')
const router = require('./src/routes/router')
var session = require('express-session')
var expressLayouts = require('express-ejs-layouts')

var MySQLStore = require('connect-mysql')(session)

var options = {
    config: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'fuxion',
    },
}

// Middleware de compresión para optimizar respuestas
app.use(compression())

app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 día
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        },
        store: new MySQLStore(options),
    })
)

// View engine setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'src/views'))
app.use(expressLayouts)
app.set('layout', 'layout')

app.use(cors(config.cors_options))
app.use(cookieParser())
app.use(body_parser.urlencoded({extended: true, limit: '10mb'}))
app.use(express.json({limit: '10mb'}))

// Archivos estáticos con cache
app.use('/public', express.static(path.join(__dirname, 'src/public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true
}))

// Servir sitemap y robots.txt
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public/sitemap.xml'))
})

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public/robots.txt'))
})

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
})

app.use(router.router)
app.set('port', config.port)

app.listen(config.port, () => {
    console.log(`🚀 FuXion Lifestyle Server running on port ${config.port}`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app
