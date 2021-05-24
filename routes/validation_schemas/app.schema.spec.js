const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const { validateAppBody, validateSubscriptionBody, validatePublicAppsListQuery } = require('./app.schema')
const helpers = require('../../util/test-helpers')
const Chance = require('chance')
const chance = new Chance()

describe('Apps Validations', () => {
  describe('validateAppBody', () => {
    const optionals = {
      description: chance.string(),
      shortDescription: chance.string({ max: 60 }),
      redirectUrl: chance.url(),
      redirect_url: chance.url(),
      visibility: 'public',
      logo: chance.url(),
      subscriptions: [],
      labels: [],
      tosUrl: chance.url(),
      privacyUrl: chance.url(),
      youtubeUrl: chance.url(),
      websiteUrl: chance.url(),
      supportUrl: chance.url(),
    }

    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { name: 12341 } },
        { body: { name: null } },
        { body: { name: '' } },
        { body: { name: 999, ...optionals } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateAppBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { name: chance.string(), ...optionals } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateAppBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateSubscriptionBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { subscriptions: 1 } },
        { body: { subscriptions: { } } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateSubscriptionBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { subscriptions: [] } },
        { body: { subscriptions: [1] } },
        { body: { subscriptions: [1, 2, 3, 999] } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateSubscriptionBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validatePublicAppsListQuery', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { query: { org_id: 'abc' } },
        { query: { org_id: [] } },
        { query: { org_id: ['cba'] } },
        { query: { label: 543 } },
        { query: { label: [] } },
        { query: { label: [666] } },
        { query: { sort_by: 'inv' } },
        { query: { order: 'inv' } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validatePublicAppsListQuery(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { query: { } },
        { query: { org_id: 1 } },
        { query: { org_id: [1] } },
        { query: { label: 'acme' } },
        { query: { label: ['acme'] } },
        { query: { sort_by: 'app' } },
        { query: { sort_by: 'org' } },
        { query: { sort_by: 'updated' } },
        { order: { order: 'asc' } },
        { order: { order: 'desc' } },
        { order: { org_id: [1], sort_by: 'org', order: 'desc' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validatePublicAppsListQuery(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })
})
