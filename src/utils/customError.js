class ARFError extends Error {
  constructor(code, message) {
    const fullMsg = message ? `${code}: ${message}` : code
    super(fullMsg)
    this.name = 'MetadataError'
    this.code = code
    this.fullMsg = fullMsg
    this.message = message
  }
  
  toString() {
    return this.message
  }  
}

class MetadataError extends ARFError {
  constructor(code, message) {
    super(code, message)
    this.name = 'MetadataError'
  }
}

class RecordCreationError extends ARFError {
  constructor(code, message) {
    super(code, message)
    this.name = 'RecordCreationError'
  }
}

class RecordError extends ARFError {
  constructor(code, message) {
    super(code, message)
    this.name = 'RecordError'
  }
}

module.exports = { 
  MetadataError,
  RecordError,
  RecordCreationError
}