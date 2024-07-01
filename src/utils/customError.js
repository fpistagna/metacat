class MetadataError extends Error {
  constructor(code, message) {
    const fullMsg = message ? `${code}: ${message}` : code
    super(fullMsg)
    this.name = 'MetadataError'
    this.code = code
    this.message = fullMsg
  }
  
  toString() {
    return this.message
  }
}

class RecordCreationError extends Error {
  constructor(code, message) {
    const fullMsg = message ? `${code}: ${message}` : code
    super(fullMsg)
    this.name = 'RecordCreationError'
    this.code = code
    this.message = fullMsg
  }

  toString() {
    return this.message
  }
}

class RecordError extends Error {
  constructor(code, message) {
    const fullMsg = message ? `${code}: ${message}` : code
    super(fullMsg)
    this.name = 'RecordError'
    this.code = code
    this.message = fullMsg
  }

  toString() {
    return this.message
  }
}
module.exports = { 
  MetadataError,
  RecordError,
  RecordCreationError
}