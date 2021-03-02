const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const {
  validateOrganizationUpdateBody,
  validateOrgBody,
  validateAssignUserBody,
} = require('./organization.schema')
const helpers = require('../../util/test-helpers')
const Chance = require('chance')
const chance = new Chance()

describe('Organzation Validations', () => {
  describe('validateOrganizationUpdateBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { name: chance.integer(), description: chance.integer() } },
        { body: { name: chance.string(), description: chance.integer() } },
        { body: { name: chance.string(), vat: chance.integer() } },
        { body: { name: chance.string(), logo: chance.integer() } },
        { body: { name: chance.string(), tosUrl: chance.integer() } },
        { body: { name: chance.string(), privacyUrl: chance.integer() } },
        { body: { name: chance.string(), youtubeUrl: chance.integer() } },
        { body: { name: chance.string(), websiteUrl: chance.integer() } },
        { body: { name: chance.string(), supportUrl: chance.integer() } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateOrganizationUpdateBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { name: chance.string(), description: chance.string() } },
        { body: { name: chance.string(), description: '' } },
        { body: { name: chance.string(), description: null } },
        { body: { name: chance.string(), vat: '' } },
        { body: { name: chance.string(), logo: '' } },
        { body: { name: chance.string(), tosUrl: '' } },
        { body: { name: chance.string(), privacyUrl: '' } },
        { body: { name: chance.string(), youtubeUrl: '' } },
        { body: { name: chance.string(), websiteUrl: '' } },
        { body: { name: chance.string(), supportUrl: '' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateOrganizationUpdateBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateOrgBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { someprop: chance.string() } },
        { body: { name: chance.integer() } },
        { body: { name: { } } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateOrgBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { name: chance.string() } },
        { body: { name: chance.string(), extra: '' } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateOrgBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })

  describe('validateAssignUserBody', () => {
    describe('test invalid payloads', () => {
      const testData = [
        { body: { } },
        { body: { user_id: chance.string() } },
        { body: { org_id: chance.integer() } },
        { body: { user_id: chance.integer(), org_id: chance.integer() } },
        { body: { user_id: chance.string(), org_id: chance.integer() } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateAssignUserBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })

    describe('test valid payloads', () => {
      const testData = [
        { body: { user_id: chance.string(), org_id: chance.string() } },
        { body: { user_id: chance.string(), org_id: chance.string(), extra: 123 } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateAssignUserBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })
  })
})
