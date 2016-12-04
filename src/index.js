'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const Rut = require('rutjs');
const Fuse = require('fuse.js');

const options = {transform: cheerio.load};
const domain = 'http://chile.rutificador.com';

const getFullName = data => {
  const _rut = new Rut(data);
  const rut = _rut.isValid ? _rut.getNiceRut(false) : '1';
  options.url = `${domain}/rut/${rut}/`;
  return rp(options).then($ => {
    const fullName = $('h1:contains(Nombre)').next().text();
    if (fullName === '') throw new Error('Not found full name');
    return fullName.split(', Buscas')[0];
  });
};

const reverse = name => {
  const words = name.split(' ');
  if (words.length !== 4) return name;
  return words.slice(2, 4).concat(words.slice(0, 2)).join(' ');
};

const titleize = name => {
  return name.toLowerCase().replace(/(?:^|\s|-)\S/g, c => c.toUpperCase());
};

const fuzzzySearch = (name, list) => {
  const options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: ['fullName']
  };
  const fuse = new Fuse(list, options);
  return fuse.search(name);
};

const getRut = name => {
  options.url = `${domain}/`;
  const rpap = rp.defaults({jar: true});
  return rpap(options)
    .then($ => $('input[name=csrfmiddlewaretoken]').val())
    .then(csrf => {
      const options = {
        method: 'POST',
        url: `${domain}/get_generic_ajax/`,
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
            url: `${domain}/rut/${rut.getNiceRut(false)}/`,
            fullName: titleize(x.name),
            rut: rut.getNiceRut()
          };
        });
      }
      return results;
    });
};

const isEnterprise = rut => {
  return rut.length === 12 && parseInt(rut[0], 10) > 5;
};

const getPersonRut = name => {
  return getRut(name).then(results => {
    const list = results.filter(x => !isEnterprise(x.rut)).map(x => {
      return {url: x.url, fullName: reverse(x.fullName), rut: x.rut};
    });
    return fuzzzySearch(name, list);
  });
};

const getEnterpriseRut = name => {
  return getRut(name).then(results => {
    const list = results.filter(x => isEnterprise(x.rut));
    return fuzzzySearch(name, list);
  });
};

module.exports = {
  getFullName: getFullName,
  getPersonRut: getPersonRut,
  getEnterpriseRut: getEnterpriseRut
};
