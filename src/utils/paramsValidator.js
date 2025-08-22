const { validationResult } = require('express-validator')
const customError = require('./customError')
const className = "paramsValidator",
  LoggerHelper = require('./loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

module.exports.paramsValidator = (req, res, next) => {
  Logger.callerFunction = 'paramsValidator'

  const result = validationResult(req)
  Logger.logs({
    verbose: {
      validation: JSON.stringify(result),
      validationResult: result.isEmpty()
    }
  })

  if (!result.isEmpty()) {
    throw new customError.MetadataError(12, 
      `${result.errors[0].value} - `+
    	`${result.errors[0].msg}`)
  }
  next()
}

module.exports.checkAttribute = async (a) => {
  Logger.callerFunction = 'paramsValidator'

  Logger.logs({
    verbose: {
      checkAttribute: a
    }
  })

  if(! await ["doi", "identifiers", "creators", "titles", 
      "publisher", "publicationYear", "descriptions"].includes(a)) {

    Logger.logs({
      verbose: {
        checkAttribute: `${a} notAllowed`
      }
    })
    throw new customError.MetadataError(12, 
      `Attribute ${a} not allowed`)
    //return false
  }
}
