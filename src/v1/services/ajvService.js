'use strict';

/* Preload Schemas */
const schema = require("../../../schemas/root.json"),
  metadataSchema = require("../../../schemas/datacite.json"),
  doiSchema = require("../../../schemas/attributes.doi.json"),
  prefixSchema = require("../../../schemas/attributes.prefix.json"),
  suffixSchema = require("../../../schemas/attributes.suffix.json"),
  identifierSchema = require("../../../schemas/identifiers.json"),
  creatorSchema = require("../../../schemas/creators.json"),
  creatorAffiliationSchema = require("../../../schemas/creators.affiliation.json"),
  creatorNameIdenfierSchema = require("../../../schemas/creators.nameIdentifier.json"),
  titleSchema = require("../../../schemas/titles.json"),
  publisherSchema = require("../../../schemas/publisher.json"),
  publicationYearSchema = require("../../../schemas/attributes.publicationYear.json");

const Ajv = require("ajv"),
  ajv = new Ajv({
    strictRequired: true,
    removeAdditional: "all"
  },
  {
    schemas: [ 
      schema,
      metadataSchema,
      doiSchema,
      prefixSchema,
      suffixSchema,
      identifierSchema,
      creatorSchema,
      creatorAffiliationSchema,
      creatorNameIdenfierSchema,
      titleSchema,
      publisherSchema,
      publicationYearSchema
    ]
  });

ajv.addSchema(metadataSchema, "metadata#");
ajv.addSchema(doiSchema, "attributes.doi#");
ajv.addSchema(prefixSchema, "attributes.prefix#");
ajv.addSchema(suffixSchema, "attributes.suffix#");
ajv.addSchema(identifierSchema, "identifiers#");
ajv.addSchema(creatorAffiliationSchema, "creators.affiliation#");
ajv.addSchema(creatorNameIdenfierSchema, "creators.nameIdentifier#");
ajv.addSchema(creatorSchema, "creators#");
ajv.addSchema(titleSchema, "titles#");
ajv.addSchema(publisherSchema, "publisher#");
ajv.addSchema(publicationYearSchema, "attributes.publicationYear#");

const winston = require('../../utils/logger')
const className = "AJVService"

module.exports.validator = (req, res, next) => {
  const validate = ajv.compile(schema);
  const valid = validate(req.body);

  winston.debug(`${className}:validator:${valid}`)
  winston.verbose(`${className}:validator:`+
    `body:${JSON.stringify(req.body)}:`+
    `validation:${valid}`)

  if (!valid) {
    winston.error(`${className}:validator:${valid}:`+
      `${JSON.stringify(validate.errors)}`)
    res.respond({ 
      status: "error", 
      error: validate.errors }, 400)
  }
  else
    next();
}

module.exports.patchValidator = (req, res, next) => {
  const schema = require("../../../schemas/patchRootSchema.json")
  const patchValidate = ajv.compile(schema);
  const valid = patchValidate(req.body);

  winston.debug(`${className}:validator:${valid}`)
  winston.verbose(`${className}:validator:`+
    `body:${JSON.stringify(req.body)}:`+
    `validation:${valid}`)

  if (!valid) {
    winston.error(`${className}:validator:${valid}:`+
      `${JSON.stringify(patchValidate.errors)}`)
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