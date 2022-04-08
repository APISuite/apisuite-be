const HTTPStatus = require('http-status-codes')
const {
  models,
  sequelize,
} = require('../models')

const planControl = async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const plan = await models.Plan.findAll({
      transaction,
    })

    if (plan.length === 0) {
      res.loggedInUser.type = 'full'
    }

    req.user.type = plan[0].dataValues.type
    req.user.plan = plan[0].dataValues.plan
  } catch (err) {
    return res.status(HTTPStatus.BAD_REQUEST).json({ errors: ['ERROR GETTING PLAN'] })
  }
}

module.exports = {
  planControl,
}
