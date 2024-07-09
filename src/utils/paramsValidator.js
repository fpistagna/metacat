const { validationResult } = require('express-validator')
const customError = require('./customError');

module.exports.paramsValidator = (req, res, next) => {
  const result = validationResult(req);
  console.log(`\n\n\n ${JSON.stringify(result)} - ${result.isEmpty()}\n\n\n`)
  if (!result.isEmpty()) {
    throw new customError.MetadataError(6, `${result.errors[0].value} - `+
    	`${result.errors[0].msg}`)
  }
  next();
}

module.exports.checkAttribute = async (a) => {
  console.log(`\n\n\n ${a} \n\n\n`)
  if(! await ["doi", "prefix", "suffix", "identifiers", "creators", "titles", 
      "publisher", "publicationYear"].includes(a))
  	return false
}
