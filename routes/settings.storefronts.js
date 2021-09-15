const { decorateRouter } = require('@awaitjs/express')
const router = decorateRouter(require('express').Router())
const controllers = require('../controllers')

/**
 *
 */
router.getAsync('/:store',
  controllers.settingsStorefronts.get)

module.exports = router
