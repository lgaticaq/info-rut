'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const Rut = require('rutjs');

const getFullName = data => {
  const _rut = new Rut(data);
  const rut = _rut.isValid ? _rut.getNiceRut(false) : '1';

  const options = {
    url: `http://datos.24x7.cl/rut/${rut}/`,
    transform: cheerio.load
  };
  return rp(options).then($ => {
    const fullName = $('h1:contains(Nombre)').next().text();
    if (fullName === '') throw new Error('Not found full name');
    return fullName.split(', Buscas')[0];
  });
};

const getRut = name => {
  const options = {
    url: 'http://datos.24x7.cl/',
    transform: cheerio.load
  };
  const rpap = rp.defaults({jar: true});
  return rpap(options)
    .then($ => $('input[name=csrfmiddlewaretoken]').val())
    .then(csrf => {
      const options = {
        method: 'POST',
        url: 'http://datos.24x7.cl/get_generic_ajax/',
        form: {
          entrada: name,
          csrfmiddlewaretoken: csrf
        },
        json: true
      };
      return rpap(options);
    }).then(data => {
      let results = [];
      if (data.status === 'success') {
        results = data.value.map(x => {
          const rut = new Rut(x.rut.toString(), true);
          return {
            url: `http://datos.24x7.cl/rut/${rut.getNiceRut(false)}/`,
            fullName: x.name,
            rut: rut.getNiceRut(false)
          };
        });
      }
      return results;
    });
};

module.exports = {
  getFullName: getFullName,
  getRut: getRut
};
