const { validationResult } = require('express-validator')
const customError = require('./customError');

module.exports.paramsValidator = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw new customError.MetadataError(6, `${result.errors[0].value} - `+
    	`${result.errors[0].msg}`)
  }
  next();
}

module.exports.checkAttribute = async (a) => {
  if(! await ["doi", "prefix", "suffix", "identifiers", "creators", "titles", 
      "publisher", "publicationYear"].includes(a))
  	return false
}
