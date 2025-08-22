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
    Logger.error({ error: JSON.stringify(validate.errors) });

    res.respond({ 
      status: "error", 
      error: validate.errors }, 400)
  }
  else
    next();
}

module.exports.patchValidator = (req, res, next) => {
  Logger.callerFunction = 'validator';
  const schema = require("../../../schemas/patchRootSchema.json");
  const patchValidate = ajv.compile(schema);
  const valid = patchValidate(req.body);

  Logger.logs({
    debug: { valid: valid },
    verbose: {
      body: JSON.stringify(req.body),
      valid: valid
    }
  });

  if (!valid) {
    Logger.error({ 
      error: `valid:${valid}:${JSON.stringify(patchValidate.errors)}`
    });
    res.respond({ 
      status: "error", 
      error: patchValidate.errors }, 404)
  }
  else
    next();
}

module.exports.cliValidator = (data) => {
  const validate = ajv.compile(schema);

  const valid = validate(data);
  console.log(valid);
  if (!valid)
    console.log({ status: "errors", error: validate.errors });
  else
    console.log({ status: "valid", data: JSON.stringify(data) });
}