/**
 * @fileoverview paramsValidator.js file for the MetaCat <Metadata Catalog> API.
 * @copyright 2025 Fabrizio Pistagna <fabrizio.pistagna@ingv.it> - INGV Sezione Catania - Osservatorio Etneo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


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
  }
  next()
}

module.exports.checkAttribute = async (a) => {
  Logger.callerFunction = 'checkAttribute'

  Logger.logs({ verbose: { Attribute: a } })

  if(! await ["doi", "identifiers", "creators", "titles", 
      "publisher", "publicationYear", "descriptions"].includes(a)) {

    Logger.logs({ verbose: { checkAttribute: `Attribute '${a}' not allowed` } })

    // Il solo throw di un error è sufficiente,
    // L'errore vero verà poi generato da paramsValidator
    //
    throw new Error()
  }
}
