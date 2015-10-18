# info-rut

[![npm version](https://img.shields.io/npm/v/info-rut.svg?style=flat-square)](https://www.npmjs.com/package/info-rut)
[![npm downloads](https://img.shields.io/npm/dm/info-rut.svg?style=flat-square)](https://www.npmjs.com/package/info-rut)
[![Build Status](https://img.shields.io/travis/lgaticaq/info-rut.svg?style=flat-square)](https://travis-ci.org/lgaticaq/info-rut)
[![dependency Status](https://img.shields.io/david/lgaticaq/info-rut.svg?style=flat-square)](https://david-dm.org/lgaticaq/info-rut#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/lgaticaq/info-rut.svg?style=flat-square)](https://david-dm.org/lgaticaq/info-rut#info=devDependencies)
[![Join the chat at https://gitter.im/lgaticaq/info-rut](https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-brightgreen.svg?style=flat-square)](https://gitter.im/lgaticaq/info-rut?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Get full name from a valid RUT

## Installation

```bash
npm i -S info-rut
```

## Use

```node
import infoRut from 'info-rut'

const rut = '11111111-1'

// Promise
infoRut(rut).then((fullName) => console.log(fullName))
  .fail((err) => console.error(err))

// Callback
infoRut(rut, (err, fullName) {
  if (err) return console.error(err)
  console.log(fullName)
})
```
