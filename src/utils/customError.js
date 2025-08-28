class ARFError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;

    // Aggiunge eventuali proprietà extra passate nelle opzioni
    Object.assign(this, options);
  }
}

class MetadataError extends ARFError {
  constructor(code, message, { recordMetadataId }) {
    super(code, message, { recordMetadataId });
  }
}

class RecordError extends ARFError { 
  constructor(code, message, { recordId, query }) {
    super(code, message, { recordId, query });
  }
}

class RecordCreationError extends ARFError { 
  constructor(code, message, { mdObj }) {
    super(code, message, { mdObj });
  }
}

class UserError extends ARFError {
  constructor(code, message, { email }) {
    super(code, message, { email });
  }
}

class MongooseError extends ARFError { }

module.exports = { 
  MetadataError,
  RecordError,
  RecordCreationError,
  MongooseError,
  UserError
}