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


module.exports.validator = (req, res, next) => {
  const validate = ajv.compile(schema);

  const valid = validate(req.body);
  console.log(valid);
  if (!valid)
    /*return ({ "errors": validate.errors,
      "code": validate(data)})*/
    res.status(400).send({ status: "errors", error: validate.errors });
  else
    //console.log(JSON.stringify(data, null, 4));
    next();
}

module.exports.patchValidator = (req, res, next) => {
  const schema = require("../../../schemas/patchRootSchema.json")

  const patchValidate = ajv.compile(schema);
  const valid = patchValidate(req.body);
  console.log(valid);
  if (!valid)
    res.status(400).send({ status: "errors", error: patchValidate.errors });
  else
    next();
}