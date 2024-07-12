const { validationResult } = require('express-validator')
const customError = require('./customError');
const winston = require('./logger')
const className = "paramsValidator"

module.exports.paramsValidator = (req, res, next) => {
  const result = validationResult(req);
  winston.verbose(`${className}:paramsValidator:`+
    `validationResult:${JSON.stringify(result)}`)
  winston.verbose(`${className}:paramsValidator:`+
    `validationResult:${result.isEmpty()}`)

  if (!result.isEmpty()) {
    throw new customError.MetadataError(6, `${result.errors[0].value} - `+
    	`${result.errors[0].msg}`)
  }
  next();
}

module.exports.checkAttribute = async (a) => {
  winston.verbose(`${className}:checkAttribute:${a}`)
  if(! await ["doi", "prefix", "suffix", "identifiers", "creators", "titles", 
      "publisher", "publicationYear"].includes(a)) {
    winston.verbose(`${className}:checkAttribute:${a}:notAllowed`)
    throw new customError.MetadataError(6, `Attribute ${a} not allowed`)
    //return false
  }
}
