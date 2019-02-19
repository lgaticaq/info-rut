'use strict'

const https = require('https')
const querystring = require('querystring')
const { validate, format } = require('rut.js')
const Fuse = require('fuse.js')
const cheerio = require('cheerio')
const fromEntries = require('object.fromentries')

const getData = params => {
  return new Promise((resolve, reject) => {
    const paths = new Map([['rut', '/rut'], ['name', '/buscar']])
    const hostnames = new Map([
      ['person', 'www.nombrerutyfirma.cl'],
      ['enterprise', 'www.boletaofactura.cl']
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

const reverse = name => {
  const words = name.split(' ')
  if (words.length !== 4) return name
  return words
    .slice(2, 4)
    .concat(words.slice(0, 2))
    .join(' ')
}

const titleize = name => {
  return name.toLowerCase().replace(/(?:^|\s|-)\S/g, c => c.toUpperCase())
}

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
  return fuse.search(name)
}

const getRut = async (name, type) => {
  const params = {
    type,
    term: name.replace(/\s/g, '+'),
    key: 'name'
  }
  const data = await getData(params)
  return data
}

const getPersonByName = async name => {
  const results = await getRut(name, 'person')
  return fuzzzySearch(name, results)
}

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
