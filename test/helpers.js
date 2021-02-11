const sinon = require('sinon')

const calledWithErrors = (func) => {
  sinon.assert.calledWith(func, sinon.match({ errors: sinon.match.array }))
}

const getFakeTxn = () => ({
  commit: sinon.spy(async () => undefined),
  rollback: sinon.spy(async () => undefined),
  _reset: function () {
    this.commit.resetHistory()
    this.rollback.resetHistory()
  },
})

module.exports = {
  calledWithErrors,
  getFakeTxn,
}
