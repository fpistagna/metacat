class ARFError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;

    // Aggiunge eventuali proprietà extra passate nelle opzioni
    Object.assign(this, options);
  }
}

class MetadataError extends ARFError { }
class RecordError extends ARFError { }
class RecordCreationError extends ARFError { }
class MongooseError extends ARFError { }
class UserError extends ARFError { }
class ValidationError extends ARFError { }

module.exports = { 
  MetadataError,
  RecordError,
  RecordCreationError,
  MongooseError,
  UserError,
  ValidationError
}