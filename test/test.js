'use strict'

const { describe, it, beforeEach } = require('mocha')
const { expect } = require('chai')
const nock = require('nock')
const lib = require('../src')

describe('info-rut', () => {
  describe('getFullName valid rut', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: '11111111-1' })
        .reply(200, [{ rut: '111111111', name: 'anonymous' }])
    })
    it('should return a full name', async () => {
      const fullName = await lib.getFullName('11111111-1')
      expect(fullName).to.eql('Anonymous')
    })
  })

  describe('getFullName invalid rut', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: '11111111-1' })
        .reply(200, [])
    })
    it('should return a error', async () => {
      try {
        await lib.getFullName('1')
      } catch (err) {
        expect(err).to.be.an('error')
      }
    })
  })

  describe('getFullName not found rut', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: '11111111-1' })
        .reply(200, [])
    })
    it('should return a error', async () => {
      try {
        await lib.getFullName('11111111-1')
      } catch (err) {
        expect(err).to.be.an('error')
      }
    })
  })

  describe('getPersonRut valid name', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: 'perez' })
        .reply(200, [
          { name: 'perez soto juan pedro', rut: '111111111' },
          { name: 'perez soto pedro', rut: '222222222' }
        ])
    })
    it('should return a array of results', async () => {
      const results = await lib.getPersonRut('perez')
      expect(results).to.eql([
        {
          fullName: 'Perez Soto Pedro',
          rut: '22.222.222-2',
          url: `https://rutify.cl/rut/222222222`
        },
        {
          fullName: 'Juan Pedro Perez Soto',
          rut: '11.111.111-1',
          url: `https://rutify.cl/rut/111111111`
        }
      ])
    })
  })

  describe('getPersonRut invalid name', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: 'asdf' })
        .reply(200, [])
    })
    it('should return a empty results', async () => {
      const results = await lib.getPersonRut('asdf')
      expect(results).to.eql([])
    })
  })

  describe('getEnterpriseRut valid name', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: 'sushi' })
        .reply(200, [
          { name: 'SUSHI CHILE', rut: '777777777' },
          { name: 'SUSHI SANTIAGO', rut: '888888888' }
        ])
    })
    it('should return a array of results', async () => {
      const results = await lib.getEnterpriseRut('sushi')
      expect(results).to.eql([
        {
          fullName: 'Sushi Chile',
          rut: '77.777.777-7',
          url: `https://rutify.cl/rut/777777777`
        },
        {
          fullName: 'Sushi Santiago',
          rut: '88.888.888-8',
          url: `https://rutify.cl/rut/888888888`
        }
      ])
    })
  })

  describe('getEnterpriseRut invalid name', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: 'asdf' })
        .reply(200, [])
    })
    it('should return a empty results', async () => {
      const results = await lib.getEnterpriseRut('asdf')
      expect(results).to.eql([])
    })
  })

  describe('server error', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: 'asdf' })
        .reply(500)
    })
    it('should return a empty results', async () => {
      try {
        await lib.getEnterpriseRut('asdf')
      } catch (err) {
        expect(err).to.be.an('error')
      }
    })
  })

  describe('json error', () => {
    beforeEach(() => {
      nock('https://api.rutify.cl')
        .get('/search')
        .query({ q: 'asdf' })
        .reply(200, 'bad json')
    })
    it('should return a empty results', async () => {
      try {
        await lib.getEnterpriseRut('asdf')
      } catch (err) {
        expect(err).to.be.an('error')
      }
    })
  })
})
