'use strict';

/* Preload Schemas */
const schema = require("../../../schemas/root.json"),
  metadataSchema = require("../../../schemas/datacite.json"),
  doiSchema = require("../../../schemas/doi.json"),
  identifierSchema = require("../../../schemas/identifiers.json"),
  creatorSchema = require("../../../schemas/creators.json"),
  creatorAffiliationSchema = require("../../../schemas/creators.affiliation.json"),
  creatorNameIdenfierSchema = require("../../../schemas/creators.nameIdentifier.json"),
  titleSchema = require("../../../schemas/titles.json"),
  publisherSchema = require("../../../schemas/publisher.json"),
  publicationYearSchema = require("../../../schemas/publicationYear.json"),
  subjectSchema = require("../../../schemas/subjects.json"),
  resourceTypeSchema = require("../../../schemas/resourceType.json"),
  dateSchema = require("../../../schemas/dates.json"),
  contributorSchema = require("../../../schemas/contributors.json"),
  descriptionSchema = require("../../../schemas/descriptions.json");

const addFormats = require("ajv-formats");
const Ajv = require("ajv"),
  ajv = new Ajv({
    strictRequired: true,
    removeAdditional: "all"
  });

addFormats(ajv);

ajv.addSchema(metadataSchema, "metadata#");
ajv.addSchema(doiSchema, "doi#");
ajv.addSchema(identifierSchema, "identifiers#");
ajv.addSchema(creatorAffiliationSchema, "creators.affiliation#");
ajv.addSchema(creatorNameIdenfierSchema, "creators.nameIdentifier#");
ajv.addSchema(creatorSchema, "creators#");
ajv.addSchema(titleSchema, "titles#");
ajv.addSchema(publisherSchema, "publisher#");
ajv.addSchema(publicationYearSchema, "publicationYear#");
ajv.addSchema(subjectSchema, "subjects#");
ajv.addSchema(resourceTypeSchema, "resourceType#");
ajv.addSchema(dateSchema, "dates#");
ajv.addSchema(contributorSchema, "contributors#");
ajv.addSchema(descriptionSchema, "descriptions#");

const className = "AJVService",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className);

module.exports.validator = (req, res, next) => {
  Logger.callerFunction = 'validator';

  const validate = ajv.compile(schema);
  const valid = validate(req.body);

  Logger.logs({
    debug: { valid: valid },
    verbose: {
      body: JSON.stringify(req.body),
      valid: valid
    }
  });

  if (!valid) {
    Logger.error({ error: { message: JSON.stringify(validate.errors) } });

    res.respond({ 
      status: "error", 
      error: validate.errors }, 400)
  }
  else
    next();
}

module.exports.attributePatchValidator = (req, res, next) => {
  Logger.callerFunction = 'attributePatchValidator';

  const attributeName = req.params.attribute;

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

  const schemaId = schemaIdMap[attributeName];

  Logger.logs({
    debug: {
      attribute: attributeName
    }
  });
  // Se non troviamo uno schema per questo attributo, la richiesta non è valida
  if (!schemaId) {
    Logger.error( {
      error: `Attribute '${attributeName}' cannot be updated. No Schema found ` 
    })
    return next(new customError.MetadataError(13,
      `Attribute '${attributeName}' cannot be updated via this endpoint.`));
  }

  // Ottieni lo schema già compilato da AJV usando il suo ID
  const validate = ajv.getSchema(schemaId);
  // Valida il req.body DIRETTAMENTE contro lo schema specifico (es. creators#)
  const valid = validate(req.body);

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
    return res.status(400).send({
      status: "error",
      error: validate.errors
    })
  }

  next()
}
