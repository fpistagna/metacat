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
      `Attribute '${result.errors[0].value}' is not included in the Attributes list ` +
      `["doi", "identifiers", "creators", "titles", ` +
      `"publisher", "publicationYear", "descriptions"]`,
      {
        attr: result.errors[0].value,
        attrs: `doi, identifiers, creators, titles, ` +
          `publisher, publicationYear, descriptions`
      })
    // throw new customError.MetadataError(12, 
    //   `${result.errors[0].value} - `+
    // 	`${result.errors[0].msg}`)
  }
  next()
}

module.exports.checkAttribute = async (a) => {
  Logger.callerFunction = 'checkAttribute'

  Logger.logs({ verbose: { Attribute: a } })

  if(! await ["doi", "identifiers", "creators", "titles", 
      "publisher", "publicationYear", "descriptions"].includes(a)) {

    Logger.logs({ verbose: { checkAttribute: `Attribute '${a}' not allowed` } })

    throw new customError.MetadataError(12)
    // throw new customError.MetadataError(12, 
    //   `Attribute '${a}' is not included in the Attributes list ` + 
    //   `["doi", "identifiers", "creators", "titles", ` +
    //   `"publisher", "publicationYear", "descriptions"]`,
    // { attr: a, 
    //   attrs: `["doi", "identifiers", "creators", "titles", ` +
    //     `"publisher", "publicationYear", "descriptions"]` })
  }
}
