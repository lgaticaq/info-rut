# info-rut

[![npm version](https://img.shields.io/npm/v/info-rut.svg?style=flat-square)](https://www.npmjs.com/package/info-rut)
[![npm downloads](https://img.shields.io/npm/dm/info-rut.svg?style=flat-square)](https://www.npmjs.com/package/info-rut)
[![Build Status](https://img.shields.io/travis/lgaticaq/info-rut.svg?style=flat-square)](https://travis-ci.org/lgaticaq/info-rut)
[![Coverage Status](https://img.shields.io/coveralls/lgaticaq/info-rut/master.svg?style=flat-square)](https://coveralls.io/github/lgaticaq/info-rut?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/1c9d121eaacb3aa1ac6a/maintainability)](https://codeclimate.com/github/lgaticaq/info-rut/maintainability)
[![dependency Status](https://img.shields.io/david/lgaticaq/info-rut.svg?style=flat-square)](https://david-dm.org/lgaticaq/info-rut#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/lgaticaq/info-rut.svg?style=flat-square)](https://david-dm.org/lgaticaq/info-rut#info=devDependencies)

> Get full name from a valid RUT and RUT from full name

## Installation

```bash
npm i -S info-rut
```

## Use

[Try on RunKit](https://runkit.com/npm/info-rut)
```js
const infoRut = require('info-rut')

const rut = '11111111-1'

infoRut.getFullName(rut).then(console.log).catch(console.error)

const name = 'juan perez'
infoRut.getPersonRut(name).then(console.log).catch(console.error)
infoRut.getEnterpriseRut(name).then(console.log).catch(console.error)
```

## License

[MIT](https://tldrlegal.com/license/mit-license)
