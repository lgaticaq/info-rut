'use strict';

import rp from 'request-promise';
import cheerio from 'cheerio';
import Q from 'q';
import Rut from 'rutjs';

const getFullName = (data, callback) => {
  const deferred = Q.defer();
  const _rut = new Rut(data);
  const rut = _rut.isValid ? _rut.getNiceRut(false) : '1';

  const options = {
    url: `http://datos.24x7.cl/rut/${rut}/`,
    transform: (body) => cheerio.load(body)
  };
  rp(options).then($ => {
    const fullName = $('h1:contains(Nombre)').next().text();
    if (fullName === '') {
      deferred.reject(new Error('Not found full name'));
    } else {
      deferred.resolve(fullName);
    }
  }).catch(deferred.reject);

  deferred.promise.nodeify(callback);

  return deferred.promise;
};

const getRut = (name, callback) => {
  const deferred = Q.defer();
  const options = {
    url: `http://datos.24x7.cl/`,
    transform: (body) => cheerio.load(body)
  };
  const rpap = rp.defaults({jar: true});
  rpap(options).then($ => {
    const csrf = $('input[name=csrfmiddlewaretoken]').val();
    const options = {
      method: 'POST',
      url: 'http://datos.24x7.cl/get_generic_ajax/',
      form: {
        entrada: name,
        csrfmiddlewaretoken: csrf
      },
      json: true
    };
    rpap(options).then(data => {
      let results = [];
      if (data.status === 'success') {
        results = data.value.map(x => {
          return {
            url: `http://datos.24x7.cl/rut/${x.rut}/`,
            fullName: x.name,
            rut: x.rut
          };
        });
      }
      deferred.resolve(results);
    });
  }).catch(deferred.reject);

  deferred.promise.nodeify(callback);

  return deferred.promise;
};

module.exports = {
  getFullName: getFullName,
  getRut: getRut
};
