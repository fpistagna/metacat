// In src/services/recordService.js
//const Record = require("../database/Record")
const Mongoose = require("../database/modular/mongoose")

const Record = require("../database/modular/Record")
const RecordMetadata = require("../database/modular/RecordMetadata")

const { v4: uuid } = require("uuid")

const customError = require('../../utils/customError')

const getAllRecords = async () => {
  try {
    const allRecords = await Record.getAllRecords()
    return allRecords
  } catch (e) {
      throw new Error (`RecordService:getAllRecords:${e}`, 
        { cause: e })
  }
}

const getOneRecord = async (recordId) => {
  try {
    const record = await Record.getOneRecord(recordId)
    return (record)
  } catch (e) {
      if (e)
        throw e
      throw new Error (`RecordService:getOneRecords:\n ${e}`, 
        { cause: e })
  }
}

const getRecordByQuery = async (query) => {
  try {
    console.log(query)
    const record = await RecordMetadata.getRecordByQuery(query)
    return (record)
  } catch(e) {
    console.log(e)
  }
}

async function _createRecordMetadata(metadata) {
  try {
    const recordMetadata = await RecordMetadata.createMetadata(
      metadata)
    return (recordMetadata)
  } catch (e) {
      if (e)
        throw e
      else 
        throw new customError.RecordCreationError (
          19, 
          `RecordService:createRecordMetadata:${e}`, 
          { cause: e }
        )
  }
}

async function _createNewRecord(id, metadata) {
  try {
    return ({
     record: {
       id: uuid(),
       doi: id
     },
     timestamps: {
       createdAt: new Date().toLocaleString("en-US", { timeZone: "UTC" }),
       updatedAt: new Date().toLocaleString("en-US", { timeZone: "UTC" })
     },
     metadata: metadata    
    })
  } catch (e) {
      throw new Error (`RecordService:_createNewRecord:${e}`, { cause: e })
  }
}

const createNewRecord = async (data) => {
  try {
    let recordMetadata = await _createRecordMetadata(data.metadata)
    let newRecord = await _createNewRecord(data.metadata.id, recordMetadata)
    let record = await Record.createNewRecord(newRecord)
    return(record)
  } catch (e) {
      if (e)
        throw e
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
    const updatedRecord = await Record.updateOneRecordAttribute(
      recordId, 
      attribute, 
      data)
    return (updatedRecord)
  } catch (e) {
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
