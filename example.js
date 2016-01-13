const infoRut = require('info-rut');

const rut = '11111111-1';
const name = 'juan perez';

const fullName = await infoRut.getFullName(rut);
const results = await infoRut.getRut(name);
