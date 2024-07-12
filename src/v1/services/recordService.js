// In src/services/recordService.js
const Mongoose = require("../database/modular/mongoose"),
  Record = require("../database/modular/Record"),
  RecordMetadata = require("../database/modular/RecordMetadata")

const { v4: uuid } = require("uuid")
const winston = require('../../utils/logger')
const className = "recordService"
const customError = require('../../utils/customError')

const getAllRecords = async () => {
  try {
    const allRecords = await Record.getAllRecords()

    winston.debug(`${className}:getAllRecords:${allRecords.length}`)
    winston.verbose(`${className}:getAllRecords:${allRecords}`)
    
    return allRecords
  } catch (e) {
      if (e) {
        winston.error(`${className}:getAllRecords:${e}`)
        throw e
      }
      throw new Error (`RecordService:getAllRecords:${e}`, 
        { cause: e })
  }
}

const getOneRecord = async (recordId) => {
  try {
    const record = await Record.getOneRecord(recordId)

    winston.debug(`${className}:getOneRecord:recordId:${recordId}`)
    winston.verbose(`${className}:getOneRecord:`+
      `recordId:${recordId}:`+
      `record:${record}`)

    return (record)
  } catch (e) {
      if (e) {
        winston.error(`${className}:getOneRecord:${e}`)
        throw e
      }
      throw new Error (`${className}:getOneRecords:${e}`, 
        { cause: e })
  }
}

const getRecordAttribute = async(id, attribute) => {
  try {
    winston.debug(`${className}:getRecordAttribute:`+
      `recordId:${id}:`+
      `attribute:${attribute}`)

    const record = await Record.getOneRecord(id)
    
    if (record.metadata.attributes.hasOwnProperty(attribute)) {
      const {[attribute]: attr} = record.metadata.attributes
      return ({ record: record, attribute: attr })
    } else
      return ({ record: record } )

  } catch(e) {
      if (e) {
        winston.error(`${className}:getRecordAttribute:${e}`)
        throw e
      }
      throw new Error (`${className}:getRecordAttribute:${e}`, 
        { cause: e })
  }
}

const getRecordByQuery = async (query) => {
  try {
    winston.debug(`${className}:getRecordByQuery:query:${query}`)

    const record = await RecordMetadata.getRecordByQuery(query)
    
    winston.verbose(`${className}:getRecordByQuery:query:${record}`)

    return (record)
  } catch(e) {
      if (e) {
        winston.error(`${className}:getRecordByQuery:${e}`)
        throw e
      }
      throw new Error (`${className}:getRecordByQuery:\n ${e}`, 
        { cause: e })
  }
}

const createNewRecord = async (data) => {
  try {
    winston.verbose(`${className}:createNewRecord:${JSON.stringify(data)}`)

    let record = await Record.createNewRecord(data)

    winston.debug(`${className}:createNewRecord:`+
      `uuid:${record.record.id}`+
      `doi:${record.record.doi}`)
    winston.verbose(`${className}:createNewRecord:${record}`)

    return(record)
  } catch (e) {
      if (e) {
        winston.error(`${className}:createNewRecord:${e}`)
        throw e
      }
      throw new customError.RecordCreationError (
        18, 
        `${className}:createNewRecord:${e}`, 
        { cause: e }
      )
  }
}

const updateOneRecord = () => {
  return
}

const updateOneRecordAttribute = async (recordId, attribute, data) => {
  try {
    winston.verbose(`${className}:updateOneRecordAttribute:`+
      `recordId:${recordId}:`+
      `attribute:${attribute}:`+
      `data:${JSON.stringify(data)}`)

    const updatedRecord = await Record.updateOneRecordAttribute(
      recordId, 
      attribute, 
      data)

    winston.verbose(`${className}:updateOneRecordAttribute:${updatedRecord}`)
    
    return (updatedRecord)
  } catch (e) {
      if (e) {
        winston.error(`${className}:updateOneRecordAttribute:${e}`)
        throw e
      }
      throw new Error (`${className}:updateRecordAttribute:${e}`, 
        { cause: e })
  }
}

const deleteOneRecord = () => {
  return
}

module.exports = {
  getAllRecords,
  getOneRecord,
  getRecordAttribute,
  getRecordByQuery,
  createNewRecord,
  updateOneRecord,
  updateOneRecordAttribute,
  deleteOneRecord,
}
