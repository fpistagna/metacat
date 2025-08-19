
const Mongoose = require("./mongoose").connectDB()
const { RecordModel }  = require('./RecordSchema'),
  { RecordMetadataModel } = require('./RecordMetadataSchema'),
  customError = require('../../../utils/customError')

const winston = require('../../../utils/logger')
const className = "Mongoose:Model:Record"

const getAllRecords = async () => {
  try {
    const records = await RecordModel.getAllRecords()
    winston.debug(`${className}:getAllRecords:${records.length}`)
    winston.verbose(`${className}:getAllRecords:${records}`)
    
    return (records)
  } catch (error) {
      throw new customError.RecordError (7,
        'Error fetching Records from db..', 
        { cause: error })
  }
}

const getRecordByQuery = async (query) => {
  try {
    winston.verbose(`${className}:getRecordByQuery:`+
    `query:${JSON.stringify(query)}`)

    const records = await RecordMetadataModel.getRecordByQuery(query)

    return records
  } catch(e) {
      throw new customError.RecordError (6,
        'Error fetching Records from db using query..', 
        { cause: e })
    }
}

const getOneRecord = async (recordId) => {
  try {
    winston.verbose(`${className}:getOneRecord:`+
      `recordId:${recordId}`)

    const record = await RecordModel.getRecordWithId(recordId)    
    if (!record)
      throw Error

    winston.debug(`${className}:getOneRecord:`+
      `recordId:${recordId}`)
    winston.verbose(`${className}:getOneRecord:`+
      `recordId:${recordId}:`+
      `record:${record}`)

    return (record)
  } catch (e) {
      throw new customError.RecordError (7, 
        `Error fetching from DB..` +
        `Record id ${recordId} not found`,
        { cause: e }
      )
  }
}

const createNewRecord = async (data) => {
  try {
    winston.verbose(`${className}:createNewRecord:withData:`+
      `${JSON.stringify(data)}`)

    const metadata = await RecordMetadataModel.createMetadata(data)
    const record = await RecordModel.createRecordWithMetadata(metadata)

    if (!record) {
      winston.error(`${className}:createNewRecord:Error`)
      throw new Error ('Record:createNewRecord:RecordModel creation error')
    } else {
      winston.debug(`${className}:createNewRecord:${record.record.id}`)
      winston.verbose(`${className}:createNewRecord:${record}`)
      return (record)
  
    }
  } catch (error) {
      throw new customError.RecordCreationError (17, 
        `Error creating new Record into the DB..` + error, 
        { cause: error })
  }
}

const updateOneRecordAttribute = async(id, attribute, data) => {
  try {
    winston.verbose(`${className}:updateOneRecordAttribute:`+
      `recordId:${id}:`+
      `attribute:${attribute}:`+
      `data:${JSON.stringify(data)}`)

    let record = await RecordModel.getRecordWithId(id)
    if (!record) 
      throw new customError.RecordError (6, `Record ${id} not found`)

    const updatedMetadataRecord = await RecordMetadataModel
    .updateMetadataAttribute(
      record.metadata._id,
      attribute,
      data.metadata.attributes[attribute])

    winston.verbose(`${className}:updateOneRecordAttribute:`+
      `updatedMetadataRecord:${updatedMetadataRecord}`)

    if (updatedMetadataRecord) {
      const updatedRecord = await RecordModel.updateRecordMetadata(
        record, 
        updatedMetadataRecord)

      if (!updatedRecord)
        throw Error

      winston.debug(`${className}:updateOneRecordAttribute:`+
        `recordId:${id}:`+
        `attribute:${attribute}`)
      winston.verbose(`${className}:updateOneRecordAttribute:`+
        `recordId:${id}:`+
        `attribute:${attribute}:`+
        `updatedMetadataRecord:${updatedMetadataRecord}:`+
        `record:${updatedRecord}`)
    }

    return (updatedMetadataRecord)
  } catch (error) {
      if (error) {
        winston.error(`${className}:updateOneRecordAttribute:${error}`)
        throw error
      }
      throw new customError.RecordError (7, error, { cause: error })
  }
}

module.exports = { 
  getAllRecords,
  getOneRecord,
  getRecordByQuery,
  createNewRecord,
  updateOneRecordAttribute
}
