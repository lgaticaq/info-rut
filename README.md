# info-rut

[![npm version](https://img.shields.io/npm/v/info-rut.svg)](https://www.npmjs.com/package/info-rut)
[![npm downloads](https://img.shields.io/npm/dm/info-rut.svg)](https://www.npmjs.com/package/info-rut)
[![Build Status](https://travis-ci.org/lgaticaq/info-rut.svg?branch=master)](https://travis-ci.org/lgaticaq/info-rut)
[![Coverage Status](https://coveralls.io/repos/github/lgaticaq/info-rut/badge.svg?branch=master)](https://coveralls.io/github/lgaticaq/info-rut?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/1c9d121eaacb3aa1ac6a/maintainability)](https://codeclimate.com/github/lgaticaq/info-rut/maintainability)
[![dependency Status](https://img.shields.io/david/lgaticaq/info-rut.svg)](https://david-dm.org/lgaticaq/info-rut#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/lgaticaq/info-rut.svg)](https://david-dm.org/lgaticaq/info-rut#info=devDependencies)

> Get person or enterprise from a valid RUT or full name

## Installation

```bash
npm i -S info-rut
```

## Use

[Try on RunKit](https://runkit.com/npm/info-rut)
```js
const infoRut = require('info-rut')

const rut = '11111111-1'
infoRut.getPersonByRut(rut).then(console.log).catch(console.error)
infoRut.getEnterpriseByRut(rut).then(console.log).catch(console.error)

const name = 'juan perez'
infoRut.getPersonByName(name).then(console.log).catch(console.error)
infoRut.getEnterpriseByName(name).then(console.log).catch(console.error)
```

## License

[MIT](https://tldrlegal.com/license/mit-license)
