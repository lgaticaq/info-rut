'use strict';

const path = require('path');
const expect = require('chai').expect;
const nock = require('nock');
const lib = require('../src');

const domain = 'https://chile.rutificador.com';

describe('info-rut', () => {
  describe('getFullName valid rut', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      nock(domain)
        .get('/rut/11111111-1/')
        .replyWithFile(200, path.join(__dirname, 'valid.html'));
    });
    it('should return a full name', done => {
      lib.getFullName('11111111-1').then(fullName => {
        expect(fullName).to.eql('Anonymous');
        done();
      });
    });
  });

  describe('getFullName invalid rut', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      nock(domain)
        .get('/rut/1/')
        .replyWithFile(404, path.join(__dirname, 'invalid.html'));
    });
    it('should return a error', done => {
      lib.getFullName('1').catch(err => {
        var fn = function () { throw err; };
        expect(fn).to.throw(Error);
        done();
      });
    });
  });

  describe('getFullName not found rut', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      nock(domain)
        .get('/rut/11111111-1/')
        .replyWithFile(200, path.join(__dirname, 'notfound.html'));
    });
    it('should return a error', done => {
      lib.getFullName('11111111-1').catch(err => {
        var fn = function () { throw err; };
        expect(fn).to.throw(Error);
        done();
      });
    });
  });

  describe('getPersonRut valid name', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      const form = {entrada: 'perez', csrfmiddlewaretoken: 'asdf'};
      nock(domain)
        .get('/')
        .replyWithFile(200, path.join(__dirname, 'form.html'))
        .post('/get_generic_ajax/', form)
        .reply(200, {
          status: 'success',
          value: [
            {name: 'PEREZ SOTO JUAN PEDRO', rut: 11111111},
            {name: 'PEREZ SOTO PEDRO', rut: 22222222}
          ]
        });
    });
    it('should return a array of results', done => {
      lib.getPersonRut('perez').then(results => {
        expect(results).to.eql([
          {fullName: 'Perez Soto Pedro', rut: '22.222.222-2', url: `${domain}/rut/22222222-2/`},
          {fullName: 'Juan Pedro Perez Soto', rut: '11.111.111-1', url: `${domain}/rut/11111111-1/`}
        ]);
        done();
      });
    });
  });

  describe('getPersonRut invalid name', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      const form = {entrada: 'asdf', csrfmiddlewaretoken: 'asdf'};
      nock(domain)
        .get('/')
        .replyWithFile(200, path.join(__dirname, 'form.html'))
        .post('/get_generic_ajax/', form)
        .reply(200, {status: 'fail', value: []});
    });
    it('should return a empty results', done => {
      lib.getPersonRut('asdf').then(results => {
        expect(results).to.eql([]);
        done();
      });
    });
  });

  describe('getEnterpriseRut valid name', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      const form = {entrada: 'sushi', csrfmiddlewaretoken: 'asdf'};
      nock(domain)
        .get('/')
        .replyWithFile(200, path.join(__dirname, 'form.html'))
        .post('/get_generic_ajax/', form)
        .reply(200, {
          status: 'success',
          value: [
            {name: 'SUSHI CHILE', rut: 77777777},
            {name: 'SUSHI SANTIAGO', rut: 88888888}
          ]
        });
    });
    it('should return a array of results', done => {
      lib.getEnterpriseRut('sushi').then(results => {
        expect(results).to.eql([
          {fullName: 'Sushi Chile', rut: '77.777.777-7', url: `${domain}/rut/77777777-7/`},
          {fullName: 'Sushi Santiago', rut: '88.888.888-8', url: `${domain}/rut/88888888-8/`}
        ]);
        done();
      });
    });
  });

  describe('getEnterpriseRut invalid name', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      const form = {entrada: 'asdf', csrfmiddlewaretoken: 'asdf'};
      nock(domain)
        .get('/')
        .replyWithFile(200, path.join(__dirname, 'form.html'))
        .post('/get_generic_ajax/', form)
        .reply(200, {status: 'fail', value: []});
    });
    it('should return a empty results', done => {
      lib.getEnterpriseRut('asdf').then(results => {
        expect(results).to.eql([]);
        done();
      });
    });
  });
});
