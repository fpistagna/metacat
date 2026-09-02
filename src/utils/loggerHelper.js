/**
 * @fileoverview loggerHelper.js file for the MetaCat <Metadata Catalog> API.
 * @copyright 2025 Fabrizio Pistagna <fabrizio.pistagna@ingv.it> - INGV Sezione Catania - Osservatorio Etneo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


const winston = require('./logger')

const REDACTED_VALUE = '[REDACTED]'
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'jwt',
  'authorization',
  'authorizationheader',
  'authheader',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'clientsecret',
  'authorizationcode'
])

const normalizedKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '')

const redactSensitiveData = (value, key = '', seen = new WeakSet()) => {
  if (SENSITIVE_KEYS.has(normalizedKey(key)))
    return REDACTED_VALUE

  if (!value || typeof value !== 'object')
    return value

  if (seen.has(value))
    return '[Circular]'

  if (typeof value.toJSON === 'function') {
    const jsonValue = value.toJSON()
    if (jsonValue !== value)
      return redactSensitiveData(jsonValue, key, seen)
  }

  seen.add(value)

  const sanitizedValue = Array.isArray(value)
    ? value.map((item) => redactSensitiveData(item, '', seen))
    : Object.fromEntries(Object.entries(value)
      .map(([nestedKey, nestedValue]) => [
        nestedKey,
        redactSensitiveData(nestedValue, nestedKey, seen)
      ]))

  seen.delete(value)
  return sanitizedValue
}

const logValue = (value) => value && typeof value === 'object'
  ? JSON.stringify(value)
  : value

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
    const sanitizedObject = redactSensitiveData(debugObject)

    for (let arg in Object.keys(sanitizedObject)) {
        retString += 
          `:${Object.keys(sanitizedObject)[arg]}`+
          `:${logValue(sanitizedObject[Object.keys(sanitizedObject)[arg]])}`
    }
    return retString
  }

  verboseString(verboseObject) {
    let retString = `${this.className}:${this.callerName}`
    const sanitizedObject = redactSensitiveData(verboseObject)

    for (let arg in Object.keys(sanitizedObject)) {
      retString += 
        `:${Object.keys(sanitizedObject)[arg]}`+
        `:${logValue(sanitizedObject[Object.keys(sanitizedObject)[arg]])}`
    }
    return retString
  }

  errorString(error) {
    let retString = `${this.className}:${this.callerName}`
    retString += `\nerror.message:${error.message}`
    retString += `\nerror.code:${error.code}`
    if (error.stack !== undefined)
      retString += `\nerror.stack: ${error.stack}`
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

module.exports = { Logger, redactSensitiveData }
