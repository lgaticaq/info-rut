'use strict'

const https = require('https')
const querystring = require('querystring')
const { validate, format } = require('rut.js')
const Fuse = require('fuse.js')
const cheerio = require('cheerio')
const fromEntries = require('object.fromentries')

/**
 * @typedef {object} Params
 * @property {string} type - Type (person, enterprise).
 * @property {string} key - Key path (rut, name).
 * @property {string} term - Search term.
 */
/**
 * @typedef {object} Person
 * @property {string} name - Fullname.
 * @property {string} rut - RUT/DNI.
 * @property {string} gender - Gender.
 * @property {string} address - Address.
 * @property {string} city - City.
 */
/**
 * @typedef {object} Enterprise
 * @property {string} name - Fullname.
 * @property {string} item - Item.
 * @property {string} subitem - Subitem.
 * @property {string} activity - Activity.
 * @property {string} rut - RUT/DNI.
 */
/**
 * @typedef {Person | Enterprise} Payload
 */
/**
 * Get person/enterprise data from scrapping site.
 *
 * @param {Params} params -
 * @returns {Promise<Array<Payload>>} -
 * @example
 * const results = await({ term: 'leonardo', type: 'person', key: 'name' })
 */
const getData = params => {
  return new Promise((resolve, reject) => {
    const paths = new Map([
      ['rut', '/rut'],
      ['name', '/buscar']
    ])
    const hostnames = new Map([
      ['person', 'www.nombrerutyfirma.com'],
      ['enterprise', 'www.boletaofactura.com']
    ])
    const postData = querystring.stringify({ term: params.term })
    const options = {
      hostname: hostnames.get(params.type),
      port: 443,
      path: paths.get(params.key),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.8,en-US;q=0.5,en;q=0.3',
        Referer: `https://${hostnames.get(params.type)}/`,
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache'
      }
    }
    const req = https.request(options, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request Failed. Status Code: ${res.statusCode}`))
      } else {
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', chunk => {
          rawData += chunk
        })
        res.on('end', () => {
          const $ = cheerio.load(rawData)
          const data = Array.from($('table tbody tr')).map(el => {
            const keys = new Map([
              [
                'person',
                new Map([
                  [0, 'name'],
                  [1, 'rut'],
                  [2, 'gender'],
                  [3, 'address'],
                  [4, 'city']
                ])
              ],
              [
                'enterprise',
                new Map([
                  [0, 'name'],
                  [1, 'item'],
                  [2, 'subitem'],
                  [3, 'activity'],
                  [4, 'rut']
                ])
              ]
            ])
            return fromEntries(
              Array.from($(el).find('td')).reduce((acc, el, index) => {
                const key = keys.get(params.type).get(index)
                let value = $(el).text()
                if (key === 'name' && params.type === 'person') {
                  value = reverse(titleize($(el).text()))
                } else if (!['item', 'subitem', 'activity'].includes(key)) {
                  value = titleize($(el).text())
                }
                acc.set(key, value)
                return acc
              }, new Map())
            )
          })
          resolve(data)
        })
      }
    })
    req.on('error', err => reject(err))
    req.write(postData)
    req.end()
  })
}

/**
 * Get person data from a valid RUT/DNI.
 *
 * @param {string} rut - RUT/DNI.
 * @returns {Promise<Person>} -
 * @example
 * const person = await getPersonByRut('11.111.11-1')
 */
const getPersonByRut = async rut => {
  if (!validate(rut)) return null
  const params = {
    type: 'person',
    term: format(rut),
    key: 'rut'
  }
  const data = await getData(params)
  if (data.length === 0) return null
  return data[0]
}

/**
 * Get enterprise data from a valid RUT/DNI.
 *
 * @param {string} rut - RUT/DNI.
 * @returns {Promise<Enterprise>} -
 * @example
 * const person = await getPersonByRut('11.111.11-1')
 */
const getEnterpriseByRut = async rut => {
  if (!validate(rut)) return null
  const params = {
    type: 'enterprise',
    term: format(rut),
    key: 'rut'
  }
  const data = await getData(params)
  if (data.length === 0) return null
  return data[0]
}

/**
 * Reverse a fullname.
 *
 * @param {string} name - Fullname.
 * @returns {string} - Fulname in correct order.
 * @example
 * const fullname = reverse('PEREZ SOTO JUAN PEDRO')
 */
const reverse = name => {
  const words = name.split(' ')
  if (words.length !== 4) return name
  return words
    .slice(2, 4)
    .concat(words.slice(0, 2))
    .join(' ')
}

/**
 * Titleize a fullname.
 *
 * @param {string} name - Fullname.
 * @returns {string} - Fulname titleized.
 * @example
 * const fullname = reverse('PEREZ SOTO JUAN PEDRO')
 */
const titleize = name => {
  return name.toLowerCase().replace(/(?:^|\s|-)\S/g, c => c.toUpperCase())
}

/**
 * Titleize a fullname.
 *
 * @param {string} name - Fulname to search.
 * @param {Array<Payload>} list - List of person/enterprise data.
 * @returns {Array<Payload>} - List of person/enterprise data sorted.
 * @example
 * const results = await getData({ term: 'leonardo', type: 'person', key: 'name' })
 * const fullname = fuzzzySearch('leonardo', results)
 */
const fuzzzySearch = (name, list) => {
  const options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: ['name']
  }
  const fuse = new Fuse(list, options)
  return fuse.search(name).map(({ item }) => item)
}

/**
 * Get person/enterprise data from RUT/DNI.
 *
 * @param {string} name - Name to search.
 * @param {string} type - Type (person/enterprise).
 * @returns {Promise<Array<Payload>>} - List of person/enterprise data.
 * @example
 * const results = await getData('leonardo', 'person')
 */
const getRut = async (name, type) => {
  const params = {
    type,
    term: name.replace(/\s/g, '+'),
    key: 'name'
  }
  const data = await getData(params)
  return data
}

/**
 * Get person data from name.
 *
 * @param {string} name - Name to search.
 * @returns {Promise<Array<Person>>} - List of person data.
 * @example
 * const results = await getPersonByName('leonardo')
 */
const getPersonByName = async name => {
  const results = await getRut(name, 'person')
  return fuzzzySearch(name, results)
}

/**
 * Get enterprise data from name.
 *
 * @param {string} name - Name to search.
 * @returns {Promise<Array<Enterprise>>} - List of enterprise data.
 * @example
 * const results = await getEnterpriseByName('sushi')
 */
const getEnterpriseByName = async name => {
  const results = await getRut(name, 'enterprise')
  return fuzzzySearch(name, results)
}

module.exports = {
  getPersonByRut: getPersonByRut,
  getPersonByName: getPersonByName,
  getEnterpriseByName: getEnterpriseByName,
  getEnterpriseByRut: getEnterpriseByRut
}
