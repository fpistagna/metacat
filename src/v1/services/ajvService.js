'use strict'

const className = "AJVService",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className),
  customError = require('../../utils/customError')

const addFormats = require("ajv-formats")
const Ajv = require("ajv")

const ajv = new Ajv({ strictRequired: true, removeAdditional: "all" })
addFormats(ajv)

const fs = require('fs')
const path = require('path')

const schemasDirectory = path.join(__dirname, '../../../schemas')

fs.readdirSync(schemasDirectory).forEach(file => {
  if (file.endsWith('.json')) {
    const schemaPath = path.join(schemasDirectory, file)
    const schema = require(schemaPath)
    // Usiamo l'$id definito all'interno dello schema come chiave per AJV
    if (schema.$id) {
      ajv.addSchema(schema, schema.$id)
      Logger.logs({ debug: { message: `Schema loaded: ${schema.$id}` } })
    }
  }
})

const validator = (schemaName) => {
  Logger.logs({ debug: { schemaName: schemaName } })
  const schemaId = `${schemaName}#`
  const validate = ajv.getSchema(schemaId)

  if (!validate) {
    throw new Error(`Schema with id ${schemaName} not found.`)
  }

  return (req, res, next) => {
    Logger.callerFunction = `validator:${schemaName}`
    const valid = validate(req.body)

    if (!valid) {
      Logger.error({ error: { message: JSON.stringify(validate.errors) } })
      // Usiamo il nostro gestore di errori
      throw new customError.ValidationError(50, 
        validate.errors[0].message, 
        { instancePath: validate.errors[0].instancePath,
          message: validate.errors[0].message
         })
    }
    next()
  }
}

const attributePatchValidator = (req, res, next) => {
  Logger.callerFunction = 'attributePatchValidator'

  const attributeName = req.params.attribute

  // Mappa i nomi degli attributi agli ID degli schemi AJV
  const schemaIdMap = {
    creators: 'creators#',
    dates: 'dates#',
    descriptions: 'descriptions#',
    publicationYear: 'publicationYear#',
    publisher: 'publisher#',
    subjects: 'subjects#',
    titles: 'titles#',
    // Aggiungi qui le altre mappature man mano che le implementi
  }

  const schemaId = schemaIdMap[attributeName]

  Logger.logs({
    debug: {
      attribute: attributeName
    }
  })
  // Se non troviamo uno schema per questo attributo, la richiesta non è valida
  if (!schemaId) {
    Logger.error( {
      error: `Attribute '${attributeName}' cannot be updated. No Schema found ` 
    })
    return next(new customError.MetadataError(13,
      `Attribute '${attributeName}' cannot be updated via this endpoint.`))
  }

  // Ottieni lo schema già compilato da AJV usando il suo ID
  const validate = ajv.getSchema(schemaId)
  // Valida il req.body DIRETTAMENTE contro lo schema specifico (es. creators#)
  const valid = validate(req.body)

  Logger.logs({
    debug: { 
      attribute: attributeName,
      valid: valid 
    }
  })
  if (!valid) {
    Logger.error({
      error: `Invalid payload for ${attributeName}: ${JSON.stringify(validate.errors)}`
    })
    throw new customError.ValidationError(50,
      validate.errors[0].message,
      {
        instancePath: validate.errors[0].instancePath,
        message: validate.errors[0].message
      })
  }

  next()
}

module.exports = { 
  ajv,
  validator,
  attributePatchValidator
}