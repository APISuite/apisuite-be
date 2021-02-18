const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const Joi = require('joi')
const { mockRequest, mockResponse } = require('mock-req-res')
const helpers = require('../../util/test-helpers')
const validator = require('./validator')

const testSchema = Joi.object({
  prop: Joi.string().required(),
})

describe('Validator', () => {
  describe('test validator correctness', () => {
    it('should ignore a validator without the validate function', () => {
      const req = mockRequest({ body: { prop: 'myvalue' } })
      const res = mockResponse()
      const next = sinon.spy()

      validator({})(req, res, next)
      sinon.assert.called(next)
    })

    it('should ignore a validator without the invalid validate function', () => {
      const req = mockRequest({ body: { prop: 'myvalue' } })
      const res = mockResponse()
      const next = sinon.spy()

      validator({ validate: 1 })(req, res, next)
      sinon.assert.called(next)
    })
  })

  describe('test default usage', () => {
    it('should validate and call next', () => {
      const req = mockRequest({ body: { prop: 'myvalue' } })
      const res = mockResponse()
      const next = sinon.spy()

      validator(testSchema)(req, res, next)
      sinon.assert.called(next)
    })

    it('should not validate and return 400', () => {
      const req = mockRequest({ body: { invalidprop: 'myvalue' } })
      const res = mockResponse()
      const next = sinon.spy()

      validator(testSchema)(req, res, next)
      sinon.assert.notCalled(next)
      sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('test nested properties', () => {
    it('should validate and call next', () => {
      const req = mockRequest({
        body: {
          parent: {
            prop: 'myvalue',
          },
        },
      })
      const res = mockResponse()
      const next = sinon.spy()

      validator(testSchema, 'body.parent')(req, res, next)
      sinon.assert.called(next)
    })

    it('should not validate and return 400 when payloadPath is invalid', () => {
      const req = mockRequest({
        body: {
          parent: {
            prop: 'myvalue',
          },
        },
      })
      const res = mockResponse()
      const next = sinon.spy()

      validator(testSchema, 'prop')(req, res, next)
      sinon.assert.notCalled(next)
      sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
      helpers.calledWithErrors(res.send)
    })
  })

  describe('test extra validation', () => {
    const extraValidator = (payload) => ({
      errors: payload.prop === 'myvalue' ? [] : ['not myvalue error'],
    })

    it('should validate and call next', () => {
      const req = mockRequest({ body: { prop: 'myvalue' } })
      const res = mockResponse()
      const next = sinon.spy()

      validator(testSchema, 'body', extraValidator)(req, res, next)
      sinon.assert.called(next)
    })

    it('should validate nested property and call next', () => {
      const req = mockRequest({
        body: {
          parent: {
            prop: 'myvalue',
          },
        },
      })
      const res = mockResponse()
      const next = sinon.spy()

      validator(testSchema, 'body.parent', extraValidator)(req, res, next)
      sinon.assert.called(next)
    })

    it('should not validate and return 400', () => {
      const req = mockRequest({ body: { prop: 'super mario' } })
      const res = mockResponse()
      const next = sinon.spy()

      validator(testSchema, 'body', extraValidator)(req, res, next)
      sinon.assert.notCalled(next)
      sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
      helpers.calledWithErrors(res.send)
    })
  })
})
