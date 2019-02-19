'use strict'

const { describe, it, beforeEach } = require('mocha')
const { expect } = require('chai')
const path = require('path')
const nock = require('nock')
const lib = require('../src')

describe('info-rut', () => {
  describe('getPersonByRut valid rut', () => {
    beforeEach(() => {
      nock('https://www.nombrerutyfirma.cl')
        .post('/rut', { term: '11.111.111-1' })
        .replyWithFile(
          200,
          path.join(__dirname, 'replies', 'person-success.html')
        )
    })
    it('should return a full name', async () => {
      const data = await lib.getPersonByRut('11111111-1')
      expect(data).to.eql({
        name: 'Juan Pedro Perez Soto',
        rut: '11.111.111-1',
        gender: 'Var',
        address: 'Calle 1',
        city: 'Santiago'
      })
    })
  })

  describe('getPersonByRut invalid rut', () => {
    it('should return a null', async () => {
      const data = await lib.getPersonByRut('1')
      expect(data).to.equal(null)
    })
  })

  describe('getPersonByRut not found rut', () => {
    beforeEach(() => {
      nock('https://www.nombrerutyfirma.cl')
        .post('/rut', { term: '11.111.111-1' })
        .replyWithFile(200, path.join(__dirname, 'replies', 'person-fail.html'))
    })
    it('should return a null', async () => {
      const data = await lib.getPersonByRut('11111111-1')
      expect(data).to.equal(null)
    })
  })

  describe('getPersonByName valid name', () => {
    beforeEach(() => {
      nock('https://www.nombrerutyfirma.cl')
        .post('/buscar', { term: 'perez' })
        .replyWithFile(
          200,
          path.join(__dirname, 'replies', 'person-success.html')
        )
    })
    it('should return a array of results', async () => {
      const results = await lib.getPersonByName('perez')
      expect(results).to.deep.include({
        name: 'Juan Pedro Perez Soto',
        rut: '11.111.111-1',
        gender: 'Var',
        address: 'Calle 1',
        city: 'Santiago'
      })
      expect(results).to.deep.include({
        name: 'Perez Soto Juan',
        rut: '22.222.222-2',
        gender: 'Var',
        address: 'Calle 2',
        city: 'Santiago'
      })
    })
  })

  describe('getPersonByName invalid name', () => {
    beforeEach(() => {
      nock('https://www.nombrerutyfirma.cl')
        .post('/buscar', { term: 'asdf' })
        .replyWithFile(200, path.join(__dirname, 'replies', 'person-fail.html'))
    })
    it('should return a empty results', async () => {
      const results = await lib.getPersonByName('asdf')
      expect(results).to.eql([])
    })
  })

  describe('getEnterpriseByRut valid rut', () => {
    beforeEach(() => {
      nock('https://www.boletaofactura.cl')
        .post('/rut', { term: '77.777.777-7' })
        .replyWithFile(
          200,
          path.join(__dirname, 'replies', 'enterprise-success.html')
        )
    })
    it('should return a result', async () => {
      const results = await lib.getEnterpriseByRut('77777777-7')
      expect(results).to.eql({
        name: 'Sushi Chile',
        item: 'I - Hoteles y Restaurantes',
        subitem: '552 - Restaurantes, Bares y Cantinas',
        activity: '552010 - Restaurantes',
        rut: '77.777.777-7'
      })
    })
  })

  describe('getEnterpriseByRut invalid rut', () => {
    beforeEach(() => {
      nock('https://www.boletaofactura.cl')
        .post('/rut', { term: '1' })
        .replyWithFile(
          200,
          path.join(__dirname, 'replies', 'enterprise-fail.html')
        )
    })
    it('should return a empty result', async () => {
      const results = await lib.getEnterpriseByRut('1')
      expect(results).to.equal(null)
    })
  })

  describe('getEnterpriseByRut not found rut', () => {
    beforeEach(() => {
      nock('https://www.boletaofactura.cl')
        .post('/rut', { term: '77.777.777-7' })
        .replyWithFile(
          200,
          path.join(__dirname, 'replies', 'enterprise-fail.html')
        )
    })
    it('should return a empty result', async () => {
      const results = await lib.getEnterpriseByRut('77777777-7')
      expect(results).to.equal(null)
    })
  })

  describe('getEnterpriseByName valid name', () => {
    beforeEach(() => {
      nock('https://www.boletaofactura.cl')
        .post('/buscar', { term: 'sushi' })
        .replyWithFile(
          200,
          path.join(__dirname, 'replies', 'enterprise-success.html')
        )
    })
    it('should return a array of results', async () => {
      const results = await lib.getEnterpriseByName('sushi')
      expect(results).to.deep.include({
        name: 'Sushi Chile',
        item: 'I - Hoteles y Restaurantes',
        subitem: '552 - Restaurantes, Bares y Cantinas',
        activity: '552010 - Restaurantes',
        rut: '77.777.777-7'
      })
      expect(results).to.deep.include({
        name: 'Sushi Santiago',
        item: 'I - Hoteles y Restaurantes',
        subitem: '552 - Restaurantes, Bares y Cantinas',
        activity: '552010 - Restaurantes',
        rut: '88.888.888-8'
      })
    })
  })

  describe('getEnterpriseByName invalid name', () => {
    beforeEach(() => {
      nock('https://www.boletaofactura.cl')
        .post('/buscar', { term: 'asdf' })
        .replyWithFile(
          200,
          path.join(__dirname, 'replies', 'enterprise-fail.html')
        )
    })
    it('should return a empty results', async () => {
      const results = await lib.getEnterpriseByName('asdf')
      expect(results).to.eql([])
    })
  })

  describe('rsponse error', () => {
    beforeEach(() => {
      nock('https://www.boletaofactura.cl')
        .post('/buscar', { term: 'asdf' })
        .reply(500)
    })
    it('should return a empty results', async () => {
      try {
        await lib.getEnterpriseByName('asdf')
      } catch (err) {
        expect(err).to.be.an('error')
      }
    })
  })

  describe('server error', () => {
    beforeEach(() => {
      nock('https://www.boletaofactura.cl')
        .post('/buscar', { term: 'asdf' })
        .replyWithError('server error')
    })
    it('should return a empty results', async () => {
      try {
        await lib.getEnterpriseByName('asdf')
      } catch (err) {
        expect(err).to.be.an('error')
      }
    })
  })
})
