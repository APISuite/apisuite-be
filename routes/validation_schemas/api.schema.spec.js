const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const {
  validateAPIBody,
  validateApiVersionPatchBody,
  validateAPIversionBody,
} = require('./api.schema')
const helpers = require('../../util/test-helpers')

describe('API Validations', () => {
  describe('validateAPIBody', () => {
    describe('test invalid payloads', () => {
      const basePayload = { name: 'apiname' }
      const testData = [
        { body: { invalid: 1 } },
        { body: { name: 12341 } },
        { body: { name: 'apiname', baseUri: ['str', 'str'] } },
        { body: { name: 'apiname', baseUri: 'www.url.io', baseUriSandbox: {} } },
        { body: { ...basePayload, docs: { invalid: 1 } } },
        { body: { ...basePayload, docs: [{ title: 1234134 }] } },
        { body: { ...basePayload, docs: { title: 'titlestring', info: 1234 } } },
        { body: { ...basePayload, docs: [{ title: 'titlestring', info: 'infoinfo', target: 'outoftouch' }] } },
        { body: { ...basePayload, docs: { title: 'titlestring', info: 'infoinfo', target: 'outoftouch', image: 1234 } } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateAPIBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const basePayload = { name: 'apiname', baseUri: 'www.url.io', baseUriSandbox: 'www.url.sb' }
      const testData = [
        { body: basePayload },
        { body: { ...basePayload, docs: [{ target: 'product_intro' }] } },
        { body: { ...basePayload, docs: [{ target: 'feature' }] } },
        { body: { ...basePayload, docs: [{ target: 'use_case' }] } },
        { body: { ...basePayload, docs: [{ target: 'highlight' }] } },
        { body: { ...basePayload, docs: [{ title: 'lorem', target: 'product_intro' }] } },
        { body: { ...basePayload, docs: [{ title: 'lorem', info: 'ipsum', target: 'product_intro' }] } },
        { body: { ...basePayload, docs: [{ title: 'lorem', info: 'ipsum', target: 'product_intro', image: 'urlurl' }] } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateAPIBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateApiVersionPatchBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { invalid: 1 } },
        { body: { live: 12341 } },
        { body: { live: true, deprecated: ['str'] } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateApiVersionPatchBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [{
        body: {
          id: 1,
          live: false,
          deprecated: true,
          deleted: false,
        },
      }]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateApiVersionPatchBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateAPIversionBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { formdata: { fields: { invalid: 1 } } },
        { formdata: { fields: { live: 12341 } } },
        { formdata: { fields: { live: true, deprecated: ['str'] } } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateAPIversionBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [{
        formdata: {
          fields: { live: false },
        },
      }]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateAPIversionBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })
})
