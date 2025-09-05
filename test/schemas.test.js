'use strict';

const chai = require('chai');
const expect = chai.expect; // Usiamo 'expect' per uno stile di asserzione pulito

// Dobbiamo esporre l'istanza di AJV dal nostro ajvService per poterla testare
// Questo richiede una piccola modifica ad ajvService.js (vedi sotto)
const { ajv } = require('../src/v1/services/ajvService');

describe('JSON Schema Validation', () => {

  describe('Schema: auth.register', () => {

    let validate;

    before(() => {
      validate = ajv.getSchema('auth.register#');
      expect(validate).to.be.a('function');
    });

    it('should PASS with a valid registration object (happy path)', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'a-valid-password'
      };
      const isValid = validate(validData);
      expect(isValid).to.be.true;
    });

    it('should FAIL if `email` is missing (sad path)', () => {
      const invalidData = {
        username: 'testuser',
        password: 'a-valid-password'
      };
      const isValid = validate(invalidData);
      expect(isValid).to.be.false;
      // Possiamo anche controllare l'errore specifico
      expect(validate.errors[0].message).to.equal("must have required property 'email'");
    });

    it('should FAIL if `password` is too short (sad path)', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'short'
      };
      const isValid = validate(invalidData);
      expect(isValid).to.be.false;
      expect(validate.errors[0].message).to.equal('must NOT have fewer than 8 characters');
    });

    it('should FAIL if `email` has an invalid format (sad path)', () => {
      const invalidData = {
        username: 'testuser',
        email: 'not-an-email',
        password: 'a-valid-password'
      };
      const isValid = validate(invalidData);
      expect(isValid).to.be.false;
      expect(validate.errors[0].message).to.equal('must match format "email"');
    });

    it('should FAIL if `username` field is missing (sad path)', () => {
      const invalidData = {
        user: 'testuser',
        email: 'not-an-email',
        password: 'a-valid-password'
      };
      const isValid = validate(invalidData);
      expect(isValid).to.be.false;
      expect(validate.errors[0].message).to.equal(`must have required property 'username'`);
    });
  });

  describe('Schema: auth.login', () => {

    let validate;

    before(() => {
      validate = ajv.getSchema('auth.login#');
      expect(validate).to.be.a('function');
    });

    it('should PASS with a valid credential object (happy path)', () => {
      const validData = {
        email: 'test@example.com',
        password: 'a-valid-password'
      };
      const isValid = validate(validData);
      expect(isValid).to.be.true;
    });

    it('should FAIL with an invalid credential object (sad path)', () => {
      const invalidData = {
        user: 'test@example.com',
        password: 'a-valid-password'
      };
      const isValid = validate(invalidData);
      expect(isValid).to.be.false;
      expect(validate.errors[0].message).to.equal(`must have required property 'email'`);
    });
  });

  // ==========================================================
  // Test per lo schema principale (root.json)
  // ==========================================================
  describe('Schema: root', () => {
    let validate;

    before(() => {
      validate = ajv.getSchema('root#');
      expect(validate).to.be.a('function');
    });

    it('should PASS with a valid root object containing a minimally valid metadata property', () => {
      const validData = {
        metadata: {
          id: "10.1234/test",
          type: "dois",
          attributes: {
            // --- Dati minimi per soddisfare i 'required' di datacite.json ---
            doi: "10.1234/test",
            creators: [{ name: "Test Author" }],
            titles: [{ title: "Test Title" }],
            publisher: { name: "Test Publisher" },
            publicationYear: "2025",
            resourceType: { resourceTypeGeneral: "Dataset" },
            identifiers: [{ identifier: "test-id", identifierType: "Other" }]
          }
        }
      };

      const isValid = validate(validData);

      const errorDetails = isValid ? "" : JSON.stringify(validate.errors, null, 2);
      expect(isValid, `Validation failed with errors: ${errorDetails}`).to.be.true;
    });
  });
  // ==========================================================
  // Test per lo schema del contenuto dei metadati (datacite.json)
  // ==========================================================
  describe('Schema: datacite', () => {
    let validate;
    // Carichiamo un oggetto valido dai nostri dati di esempio
    const validData = require('./sample.json').metadata;
    const invalidData = require('./sample_invalid.json').metadata;
    
    before(() => {
      validate = ajv.getSchema('datacite#');
      expect(validate).to.be.a('function');
    });

    it('should PASS with a complete and valid DataCite object from sample.json', () => {
      const isValid = validate(validData);

      const errorDetails = isValid ? "" : JSON.stringify(validate.errors, null, 2);
      expect(isValid, `Validation failed with errors: ${errorDetails}`).to.be.true;
    });

    it('should FAIL with an invalid DataCite object from sample_invalid.json', () => {
      const isValid = validate(invalidData);

      const errorDetails = isValid ? "" : JSON.stringify(validate.errors, null, 2);
      expect(isValid, `Validation failed with errors: ${errorDetails}`).to.be.false;
    });

    it('should FAIL if a required attribute like `titles` is missing', () => {
      const invalidData = JSON.parse(JSON.stringify(validData));
      delete invalidData.attributes.titles;

      const isValid = validate(invalidData);
      const errorDetails = isValid ? "" : JSON.stringify(validate.errors, null, 2);
      expect(isValid, `Validation failed with errors: ${errorDetails}`).to.be.false;
      expect(validate.errors[0].params.missingProperty).to.equal('titles');
    });

    it('should FAIL if a required top-level property like `type` is missing', () => {
      const invalidData = JSON.parse(JSON.stringify(validData));
      delete invalidData.type;

      const isValid = validate(invalidData);
      const errorDetails = isValid ? "" : JSON.stringify(validate.errors, null, 2);

      expect(isValid, `Validation failed with errors: ${errorDetails}`).to.be.false;
      expect(validate.errors[0].params.missingProperty).to.equal('type');
    });

    it('should FAIL if an attribute has the wrong type (e.g., `creators` is not an array)', () => {
      const invalidData = JSON.parse(JSON.stringify(validData));
      invalidData.attributes.creators = "questo non è un array";

      const isValid = validate(invalidData);
      const errorDetails = isValid ? "" : JSON.stringify(validate.errors, null, 2);

      expect(isValid, `Validation failed with errors: ${errorDetails}`).to.be.false;
      expect(validate.errors[0].keyword).to.equal('type');
      expect(validate.errors[0].instancePath).to.equal('/attributes/creators');
    });
  });
});