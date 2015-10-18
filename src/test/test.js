'use strict'

import path from 'path'

import {expect} from 'chai'
import nock from 'nock'

import lib from '../'

describe('info-rut', () => {


  describe('valid rut', () => {

    const rut = '11111111-1'

    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://datos.24x7.cl')
        .get(`/rut/${rut}/`)
        .replyWithFile(200, path.join(__dirname, 'valid.html'))
    })

    it('should return a full name (callback)', (done) => {
      lib(rut, (err, fullName) => {
        expect(err).to.be.null
        expect(fullName).to.eql('Anonymous')
        done()
      })
    })

    it('should return a full name (promise)', (done) => {
      lib(rut).then((fullName) => {
        expect(fullName).to.eql('Anonymous')
        done()
      }).fail((err) => {
        expect(err).to.be.null
        done()
      })
    })
  })

  describe('invalid rut', () => {

    const rut = '1'

    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://datos.24x7.cl')
        .get(`/rut/${rut}/`)
        .replyWithFile(404, path.join(__dirname, 'invalid.html'))
    })

    it('should return a error (callback)', (done) => {
      lib(rut, (err, fullName) => {
        expect(err).to.eql(new Error('Not found full name'))
        expect(fullName).to.be.undefined
        done()
      })
    })

    it('should return a error (promise)', (done) => {
      lib(rut).then((fullName) => {
        expect(fullName).to.be.undefined
        done()
      }).fail((err) => {
        expect(err).to.eql(new Error('Not found full name'))
        done()
      })
    })
  })
})
