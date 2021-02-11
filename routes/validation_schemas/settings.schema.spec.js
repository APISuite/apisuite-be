const sinon = require('sinon')
const HTTPStatus = require('http-status-codes')
const { mockRequest, mockResponse } = require('mock-req-res')
const { validateSettingsBody, validateIdPSettingsBody } = require('./settings.schema')
const helpers = require('../../test/helpers')

describe('Settings Validations', () => {
  describe('validateSettingsPatch', () => {
    describe('test valid payloads', () => {
      const testData = [
        { body: { portalName: 'p' } },
        { body: { portalName: '' } },
        { body: { clientName: 'c' } },
        { body: { clientName: '' } },
        { body: { documentationURL: '' } },
        { body: { documentationURL: 'https://cloudoki.com/docs' } },
        { body: { supportURL: '' } },
        { body: { supportURL: 'https://cloudoki.com/support' } },
        { body: { socialURLs: [] } },
        { body: { socialURLs: [{ name: 'github', url: 'http://github.com/user' }] } },
        { body: { socialURLs: [{ name: 'github', url: '' }] } },
        { body: { portalName: 'p', clientName: 'c' } },
        { body: { portalName: 'p', clientName: 'c', socialURLs: [{ name: 'github', url: 'http://github.com/user' }] } },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateSettingsBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })

    describe('test invalid payloads', () => {
      const testData = [
        { body: { portalName: null } },
        { body: { portalName: 1234 } },
        { body: { unknownProp: 'abc' } },
        { body: { socialURLs: [{ name: 'hi5' }] } },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateSettingsBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })
  })

  describe('validateIdPSettingsBody', () => {
    describe('test valid payloads', () => {
      const testData = [
        { body: { provider: 'Internal', configuration: {} } },
        {
          body: {
            provider: 'Keycloak',
            configuration: {
              clientRegistrationURL: 'https://myurl/clients',
              initialAccessToken: 'alsdhgfajkhdgf',
            },
          },
        },
      ]

      testData.forEach((mockReq) => {
        it('should validate and call next', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateIdPSettingsBody(req, res, next)
          sinon.assert.called(next)
        })
      })
    })

    describe('test invalid payloads', () => {
      const testData = [
        { body: { provider: 'Internal', configuration: { prop: 123 } } },
        { body: { provider: 'Keycloak', configuration: {} } },
        {
          body: {
            provider: 'Keycloak',
            configuration: {
              clientRegistrationURL: 'ftp://myurl/clients',
              initialAccessToken: 'alsdhgfajkhdgf',
            },
          },
        },
        {
          body: {
            provider: 'Keycloak',
            configuration: {
              clientRegistrationURL: 'https://myurl/clients',
              initialAccessToken: '',
            },
          },
        },
      ]

      testData.forEach((mockReq) => {
        it('should not validate and return 400', () => {
          const req = mockRequest(mockReq)
          const res = mockResponse()
          const next = sinon.spy()

          validateIdPSettingsBody(req, res, next)
          sinon.assert.notCalled(next)
          sinon.assert.calledWith(res.status, HTTPStatus.BAD_REQUEST)
          helpers.calledWithErrors(res.send)
        })
      })
    })
  })
})
