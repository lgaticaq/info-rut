'use strict'

import path from 'path'

import {expect} from 'chai'
import nock from 'nock'

import {getFullName, getRut} from '../lib'

describe('info-rut', () => {


  describe('getFullName valid rut', () => {

    const rut = '11111111-1'

    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://datos.24x7.cl')
        .get(`/rut/${rut}/`)
        .replyWithFile(200, path.join(__dirname, 'valid.html'))
    })

    it('should return a full name (callback)', (done) => {
      getFullName(rut, (err, fullName) => {
        expect(err).to.be.null
        expect(fullName).to.eql('Anonymous')
        done()
      })
    })

    it('should return a full name (promise)', (done) => {
      getFullName(rut).then((fullName) => {
        expect(fullName).to.eql('Anonymous')
        done()
      }).fail((err) => {
        expect(err).to.be.null
        done()
      })
    })
  })

  describe('getFullName invalid rut', () => {

    const rut = '1'

    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://datos.24x7.cl')
        .get(`/rut/${rut}/`)
        .replyWithFile(404, path.join(__dirname, 'invalid.html'))
    })

    it('should return a error (callback)', (done) => {
      getFullName(rut, (err, fullName) => {
        var fn = function () { throw err; }
        expect(fn).to.throw(Error);
        expect(fullName).to.be.undefined
        done()
      })
    })

    it('should return a error (promise)', (done) => {
      getFullName(rut).then((fullName) => {
        expect(fullName).to.be.undefined
        done()
      }).fail((err) => {
        var fn = function () { throw err; }
        expect(fn).to.throw(Error);
        done()
      })
    })
  })

  describe('getRut valid rut', () => {

    const name = 'perez'

    beforeEach(() => {
      nock.disableNetConnect()
      const form = {
        entrada: name,
        csrfmiddlewaretoken: 'asdf'
      }
      nock('http://datos.24x7.cl')
        .get('/')
        .replyWithFile(200, path.join(__dirname, 'form.html'))
        .post('/get_generic_ajax/', form)
        .reply(200, {
          status: 'success',
          value: [
            {name: 'JUAN PEREZ', rut: '11111111-1'},
            {name: 'PEDRO PEREZ', rut: '22222222-2'}
          ]
        })
    })

    it('should return a full name (callback)', (done) => {
      getRut(name, (err, results) => {
        expect(err).to.be.null
        expect(results).to.eql([
          {fullName: 'JUAN PEREZ', rut: '11111111-1', url: 'http://datos.24x7.cl/rut/11111111-1/'},
          {fullName: 'PEDRO PEREZ', rut: '22222222-2', url: 'http://datos.24x7.cl/rut/22222222-2/'}
        ])
        done()
      })
    })

    it('should return a full name (promise)', (done) => {
      getRut(name).then((results) => {
        expect(results).to.eql([
          {fullName: 'JUAN PEREZ', rut: '11111111-1', url: 'http://datos.24x7.cl/rut/11111111-1/'},
          {fullName: 'PEDRO PEREZ', rut: '22222222-2', url: 'http://datos.24x7.cl/rut/22222222-2/'}
        ])
        done()
      }).fail((err) => {
        expect(err).to.be.null
        done()
      })
    })
  })

  describe('getRut invalid rut', () => {

    const name = 'asdf'

    beforeEach(() => {
      nock.disableNetConnect()
      const form = {
        entrada: name,
        csrfmiddlewaretoken: 'asdf'
      }
      nock('http://datos.24x7.cl')
        .get('/')
        .replyWithFile(200, path.join(__dirname, 'form.html'))
        .post('/get_generic_ajax/', form)
        .reply(200, {status: 'fail', value: []})
    })

    it('should return a error (callback)', (done) => {
      getRut(name, (err, results) => {
        expect(err).to.be.null
        expect(results).to.eql([])
        done()
      })
    })

    it('should return a error (promise)', (done) => {
      getRut(name).then((results) => {
        expect(results).to.eql([])
        done()
      }).fail((err) => {
        expect(err).to.be.null
        done()
      })
    })
  })
})
