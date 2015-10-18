'use strict'

import http from 'http'
import cheerio from 'cheerio'
import Q from 'q'
import Rut from 'rutjs'

export default (data, callback) => {
  const deferred = Q.defer()
  const _rut = new Rut(data)
  const rut = _rut.isValid ? _rut.getNiceRut(false) : '1'

  http.get(`http://datos.24x7.cl/rut/${rut}/`, (response) => {
    let body = ''

    response.on('data', (chunk) => body += chunk)

    response.on('end', () => {
      const $ = cheerio.load(body)
      const fullName = $('h1:contains(Nombre)').next().text()
      if (fullName === '') {
        deferred.reject(new Error('Not found full name'))
      } else {
        deferred.resolve(fullName)
      }
    })
  }).on('error', (err) => deferred.reject(err))

  deferred.promise.nodeify(callback)

  return deferred.promise
}
