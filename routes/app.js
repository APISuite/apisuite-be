const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const publicAppsRoutes = require('./app.public')
const appTypes = require('./app.types')

router.use('/public', publicAppsRoutes)
router.use('/types', appTypes)

module.exports = router
