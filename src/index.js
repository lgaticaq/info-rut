'use strict'

const https = require('https')
const querystring = require('querystring')
const { validate, clean, format } = require('rut.js')
const Fuse = require('fuse.js')

const getData = data => {
  return new Promise((resolve, reject) => {
    const qs = querystring.stringify({ q: data })
    const options = {
      hostname: 'api.rutify.cl',
      port: 443,
      path: `/search?${qs}`,
      method: 'GET'
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
          try {
            resolve(JSON.parse(rawData))
          } catch (err) {
            reject(err)
          }
        })
      }
    })
    req.on('error', err => reject(err))
    req.end()
  })
}

const getFullName = data => {
  const rut = validate(data) ? data : '1'
  return getData(rut).then(data => {
    if (data.length === 0) throw new Error('Not found full name')
    return reverse(titleize(data[0].name))
  })
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
    keys: ['fullName']
  }
  const fuse = new Fuse(list, options)
  return fuse.search(name)
}

const getRut = name => {
  return getData(name).then(data => {
    return data.map(result => {
      return {
        url: `https://rutify.cl/rut/${clean(result.rut.toString())}`,
        fullName: titleize(result.name),
        rut: format(result.rut.toString())
      }
    })
  })
}

const isEnterprise = rut => {
  return rut.length === 12 && parseInt(rut[0], 10) > 5
}

const getPersonRut = name => {
  return getRut(name).then(results => {
    const list = results.filter(x => !isEnterprise(x.rut)).map(x => {
      return { url: x.url, fullName: reverse(x.fullName), rut: x.rut }
    })
    return fuzzzySearch(name, list)
  })
}

const getEnterpriseRut = name => {
  return getRut(name).then(results => {
    const list = results.filter(x => isEnterprise(x.rut))
    return fuzzzySearch(name, list)
  })
}

module.exports = {
  getFullName: getFullName,
  getPersonRut: getPersonRut,
  getEnterpriseRut: getEnterpriseRut
}
