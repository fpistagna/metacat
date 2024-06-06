'use strict';

const fs = require('fs');
const ajv = require("./src/v1/services/ajvService")

if (process.argv[2] && process.argv[2] === '-d') {
  console.log(`Reading file ${process.argv[3]}`)
  const file = fs.readFileSync(process.argv[3])
  ajv.cliValidator(JSON.parse(file))
} else {
  console.log('Specify -d flag and a data file.')
}
