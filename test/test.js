'use strict';

const path = require('path');
const expect = require('chai').expect;
const nock = require('nock');
const lib = require('../src');

describe('info-rut', () => {


  describe('getFullName valid rut', () => {

    const rut = '11111111-1';

    beforeEach(() => {
      nock.disableNetConnect();
      nock('http://datos.24x7.cl')
        .get(`/rut/${rut}/`)
        .replyWithFile(200, path.join(__dirname, 'valid.html'));
    });

    it('should return a full name', done => {
      lib.getFullName(rut).then(fullName => {
        expect(fullName).to.eql('Anonymous');
        done();
      }).catch(err => {
        expect(err).to.be.null;
        done();
      });
    });
  });

  describe('getFullName invalid rut', () => {

    const rut = '1';

    beforeEach(() => {
      nock.disableNetConnect();
      nock('http://datos.24x7.cl')
        .get(`/rut/${rut}/`)
        .replyWithFile(404, path.join(__dirname, 'invalid.html'));
    });

    it('should return a error', done => {
      lib.getFullName(rut).then(fullName => {
        expect(fullName).to.be.undefined;
        done();
      }).catch(err => {
        var fn = function () { throw err; };
        expect(fn).to.throw(Error);
        done();
      });
    });
  });

  describe('getRut valid name', () => {

    const name = 'perez';

    beforeEach(() => {
      nock.disableNetConnect();
      const form = {
        entrada: name,
        csrfmiddlewaretoken: 'asdf'
      };
      nock('http://datos.24x7.cl')
        .get('/')
        .replyWithFile(200, path.join(__dirname, 'form.html'))
        .post('/get_generic_ajax/', form)
        .reply(200, {
          status: 'success',
          value: [
            {name: 'JUAN PEREZ', rut: 11111111},
            {name: 'PEDRO PEREZ', rut: 22222222}
          ]
        });
    });

    it('should return a array of results (promise)', done => {
      lib.getRut(name).then(results => {
        expect(results).to.eql([
          {fullName: 'JUAN PEREZ', rut: '11111111-1', url: 'http://datos.24x7.cl/rut/11111111-1/'},
          {fullName: 'PEDRO PEREZ', rut: '22222222-2', url: 'http://datos.24x7.cl/rut/22222222-2/'}
        ]);
        done();
      }).catch(err => {
        expect(err).to.be.null;
        done();
      });
    });
  });

  describe('getRut invalid name', () => {

    const name = 'asdf';

    beforeEach(() => {
      nock.disableNetConnect();
      const form = {
        entrada: name,
        csrfmiddlewaretoken: 'asdf'
      };
      nock('http://datos.24x7.cl')
        .get('/')
        .replyWithFile(200, path.join(__dirname, 'form.html'))
        .post('/get_generic_ajax/', form)
        .reply(200, {status: 'fail', value: []});
    });

    it('should return a empty results', done => {
      lib.getRut(name).then(results => {
        expect(results).to.eql([]);
        done();
      }).catch(err => {
        expect(err).to.be.null;
        done();
      });
    });
  });
});
