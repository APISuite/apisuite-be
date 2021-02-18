const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const {
  validateForgotPasswordBody,
  validateRecoverPasswordBody,
  validateLoginBody,
  validateProvider,
  validateState,
  validateCode,
} = require('./auth.schema')
const helpers = require('../../util/test-helpers')
const Chance = require('chance')
const chance = new Chance()

describe('Auth Validations', () => {
  describe('validateForgotPasswordBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { phone: 1 } },
        { body: { email: 12341 } },
        { body: { email: null } },
        { body: { email: '' } },
        { body: { email: 'imnotanemail.com' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateForgotPasswordBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { email: chance.email() } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateForgotPasswordBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateRecoverPasswordBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { token: 12345, password: 12345 } },
        { body: { token: 'notaguid' } },
        { body: { token: chance.guid({ version: 4 }) } },
        { body: { token: chance.guid({ version: 4 }), password: '1' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateRecoverPasswordBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { token: chance.guid({ version: 4 }), password: '_aValidPassword1234' } },
        { body: { token: chance.guid({ version: 4 }), password: '?!!!2Up3rm4n' } },
      ]
      console.log(testData)

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateRecoverPasswordBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateLoginBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { email: 12345, password: 12345 } },
        { body: { email: 'mock@apisuite.io' } },
        { body: { password: 'invalid' } },
        { body: { password: 'V4lidPassword123!' } },
        { body: { email: 'mock', password: 'V4lidPassword123!' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateLoginBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { email: 'mock@apisuite.io', password: 'V4lidPassword123!' } },
        { body: { email: 'acme@acme.com', password: '7a65s4dKUYJHAFSD!' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateLoginBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateProvider', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { params: { } },
        { params: { provider: 12345 } },
        { params: { provider: 'notaprovider' } },
        { body: { provider: 'keycloak' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateProvider(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { params: { provider: 'keycloak' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateProvider(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateState', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { query: { } },
        { query: { state: 12345 } },
        { params: { state: chance.string({ min: 10, max: 15 }) } },
        { query: { state: chance.string({ min: 1, max: 9 }) } },
        { query: { state: chance.string({ min: 16, max: 30 }) } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateState(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { query: { state: chance.string({ min: 10, max: 15 }) } },
        { query: { state: chance.string({ min: 10, max: 15 }) } },
        { query: { state: chance.string({ min: 10, max: 15 }) } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateState(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateCode', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { code: 12345 } },
        { params: { code: chance.string() } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateCode(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { code: chance.string() } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateCode(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })
})
