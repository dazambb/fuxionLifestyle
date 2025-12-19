const router = require('express').Router()

router.use('/', require('./web/').router)
router.use('/admin', require('./admin/').router)

module.exports.router = router