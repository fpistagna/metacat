class MetadataError extends Error {
  constructor(code, message) {
    const fullMsg = message ? `${code}: ${message}` : code;
    super(fullMsg);
    this.name = 'metadataError';
    this.code = code;
    this.message = fullMsg;
  }
  
  toString() {
    return this.message;
  }
}

class RecordError extends Error {
  constructor(code, message) {
    const fullMsg = message ? `${code}: ${message}` : code;
    super(fullMsg);
    this.name = 'recordError';
    this.code = code;
    this.message = fullMsg;
  }

  toString() {
    return this.message;
  }
}

module.exports = { 
  MetadataError,
  RecordError
}