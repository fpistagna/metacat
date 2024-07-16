const winston = require('./logger')
const className = "LoggerHelper"

class Logger {
  constructor(className) {
    winston.verbose(`${className}:constructor`)
    className = className.trim();
    this.className = className
    this.callerName = ''
  }

  set callerFunction(newName) {
      newName = newName.trim();
      if (newName === '') {
          throw 'The name cannot be empty';
      }
      this.callerName = newName;
  }

  debugString(debugObject) {
    let retString = `${this.className}:${this.callerName}`

    for (let arg in Object.keys(debugObject)) {
        retString += 
          `:${Object.keys(debugObject)[arg]}`+
          `:${debugObject[Object.keys(debugObject)[arg]]}`
    }
    return retString
  }

  verboseString(verboseObject) {
    let retString = `${this.className}:${this.callerName}`

    for (let arg in Object.keys(verboseObject)) {
      retString += 
        `:${Object.keys(verboseObject)[arg]}`+
        `:${verboseObject[Object.keys(verboseObject)[arg]]}`
    }
    return retString
  }

  errorString(error) {
    let retString = `${this.className}:${this.callerName}`
    retString += `:${error}`
    return retString
  }

  logs(logObj) {
    //winston.verbose(`${className}:Logger:logs:${JSON.stringify(logObj)}`)
    if(logObj.debug)
      winston.debug(this.debugString(logObj.debug))
    if(logObj.verbose)
      winston.verbose(this.verboseString(logObj.verbose))
  }

  error(errObj) {
    //winston.verbose(`${className}:Logger:logs:${JSON.stringify(args)}`)
    winston.error(this.errorString(errObj.error))
  }
}


module.exports.Logger = Logger