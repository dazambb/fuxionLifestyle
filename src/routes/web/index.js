const router = require('express').Router()
const web = require('../../controllers/index.js')

// Páginas principales
router.get('/', web.index)  
router.get('/index', web.index)
router.get('/productos', web.productos)
router.get('/blog', web.blog)
router.get('/blog/:id', web.blogDetail)
router.get('/distribuidor', web.distribuidor)
router.get('/contacto', web.contacto)
router.get('/quiz', web.quiz)

// API endpoints
router.post('/api/contact', web.apiContact)
router.post('/api/distributor', web.apiDistributor)
router.post('/api/newsletter', web.apiNewsletter)
router.post('/api/quiz/send-results', web.apiSendQuizResults)

module.exports.router = router
