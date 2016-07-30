# info-rut

[![npm version](https://img.shields.io/npm/v/info-rut.svg?style=flat-square)](https://www.npmjs.com/package/info-rut)
[![npm downloads](https://img.shields.io/npm/dm/info-rut.svg?style=flat-square)](https://www.npmjs.com/package/info-rut)
[![Build Status](https://img.shields.io/travis/lgaticaq/info-rut.svg?style=flat-square)](https://travis-ci.org/lgaticaq/info-rut)
[![Coverage Status](https://img.shields.io/coveralls/lgaticaq/info-rut/master.svg?style=flat-square)](https://coveralls.io/github/lgaticaq/info-rut?branch=master)
[![Code Climate](https://img.shields.io/codeclimate/github/lgaticaq/info-rut.svg?style=flat-square)](https://codeclimate.com/github/lgaticaq/info-rut)
[![dependency Status](https://img.shields.io/david/lgaticaq/info-rut.svg?style=flat-square)](https://david-dm.org/lgaticaq/info-rut#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/lgaticaq/info-rut.svg?style=flat-square)](https://david-dm.org/lgaticaq/info-rut#info=devDependencies)

> Get full name from a valid RUT and RUT from full name

## Installation

```bash
npm i -S info-rut
```

## Use

[Try on Tonic](https://tonicdev.com/npm/info-rut)
```js
const infoRut = require('info-rut')

const rut = '11111111-1'

infoRut.getFullName(rut).then(console.log).catch(console.error)

const name = 'juan perez'
infoRut.getRut(name).then(console.log).catch(console.error)
```

## License

[MIT](https://tldrlegal.com/license/mit-license)
