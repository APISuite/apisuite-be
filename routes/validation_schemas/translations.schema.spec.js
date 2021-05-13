const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const { validateLocaleParam } = require('./translations.schema')
const helpers = require('../../util/test-helpers')

describe('Translations validations', () => {
  describe('validateLocaleParam', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { params: { } },
        { params: { notlocale: 'en-US' } },
        { params: { locale: 'random' } },
        { params: { locale: 12345 } },
        { params: { locale: [] } },
        { params: { locale: {} } },
        { params: { locale: 'xx-US' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateLocaleParam(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { params: { locale: 'en-US' } },
        { params: { locale: 'pt-PT' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateLocaleParam(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })
})
