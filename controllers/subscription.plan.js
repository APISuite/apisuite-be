const {
  sequelize,
  models,
} = require('../models')
const HTTPStatus = require('http-status-codes')
const log = require('../util/logger')
const fetch = require('node-fetch')
const config = require('../config')

const insertPlan = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const plan = await models.Plan.findAll({
      transaction,
    })

    if (plan.length === 0) {
      await models.Plan.create(
        {
          type: req.body.type,
          plan: req.body.plan,
        },
        {
          transaction,
        },
      )
      await transaction.commit()
      return res.status(HTTPStatus.OK).send(req.body)
    }

    if (plan.length > 1) {
      return res.status(HTTPStatus.BAD_REQUEST).send({ errors: 'Instance Already as a Subscription Plan' })
    }
  } catch (error) {
    if (transaction) await transaction.rollback()
    log.error(error, '[INSERT SUBSCRIPTION PLAN]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Insert Subscription Plan'] })
  }
}

const getPlanBP = async (req, res) => {
  try {
    const plan = await models.Plan.findAll()

    if (req.params.type === 'blueprints') {
      const url = new URL(config.get('appConnectorBackEnd') + 'apps/getuserid/' + req.params.user_id + '?blueprint=true').href
      const options = {
        method: 'GET',
        headers: {
          cookie: req.headers.cookie,
        },
      }
      const response = await fetch(url, options)
      const result = await response.json()
      if (result.data.length >= plan[0].dataValues.plan.blueprintApps) {
        return res.status(HTTPStatus.FORBIDDEN).send()
      }
    }
    return res.status(HTTPStatus.OK).send()
  } catch (error) {
    log.error(error, '[GET SUBSCRIPTION PLAN]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Get Subscription Plan'] })
  }
}

const getCurrentPlan = async (req, res) => {
  try {
    const plan = await models.Plan.findAll()

    const outPlan = { type: plan[0].dataValues.type }

    return res.status(HTTPStatus.OK).send(outPlan)
  } catch (error) {
    log.error(error, '[GET CURRENT PLAN TYPE]')
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ errors: ['Failed to Get Current Plan Type'] })
  }
}

module.exports = {
  insertPlan,
  getPlanBP,
  getCurrentPlan,
}
