// In src/services/recordService.js
//const Record = require("../database/Record")
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
      throw new Error (`RecordService:getOneRecords:\n ${e}`, 
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
      throw new Error (`RecordService:getRecordByQuery:\n ${e}`, 
        { cause: e })
  }
}

async function _createRecordMetadata(metadata) {
  try {
    winston.verbose(`${className}:_createRecordMetadata:${JSON.stringify(metadata)}`)

    const recordMetadata = await RecordMetadata.createMetadata(
      metadata)

    winston.debug(`${className}:_createRecordMetadata:${recordMetadata.id}`)
    winston.verbose(`${className}:_createRecordMetadata:${recordMetadata}`)

    return (recordMetadata)
  } catch (e) {
      if (e) {
        winston.error(`${className}:_createRecordMetadata:${e}`)
        throw e
      }
      else 
        throw new customError.RecordCreationError (
          19, 
          `RecordService:createRecordMetadata:${e}`, 
          { cause: e }
        )
  }
}

const createNewRecord = async (data) => {
  try {
    winston.verbose(`${className}:createNewRecord:${JSON.stringify(data)}`)

    let recordMetadata = await _createRecordMetadata(data.metadata)
    let record = await Record.createNewRecord({
      metadata: recordMetadata 
    })

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
        `RecordService:createNewRecord:${e}`, 
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
      throw new Error (`RecordService:updateRecordAttribute:${e}`, 
        { cause: e })
  }
}

const deleteOneRecord = () => {
  return
}

module.exports = {
  getAllRecords,
  getOneRecord,
  getRecordByQuery,
  createNewRecord,
  updateOneRecord,
  updateOneRecordAttribute,
  deleteOneRecord,
}
