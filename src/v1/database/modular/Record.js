const Mongoose = require("./mongoose").connectDB()

const { RecordModel }  = require('./Schema'),
  { RecordMetadataModel } = require('./RecordMetadata'),
  customError = require('../../../utils/customError')

const winston = require('../../../utils/logger')
const className = "(database)Record"

const getAllRecords = async () => {
  try {
    const records = await RecordModel.find(
      {}, {limit: 10, sort: {'_id': -1}})
      //.populate("metadata")
      .exec()

    winston.debug(`${className}:getAllRecords:${records.length}`)
    winston.verbose(`${className}:getAllRecords:${records}`)
    
    return (records)
  } catch (error) {
      throw new customError.RecordError (7,
        'Error fetching Records from db..', 
        { cause: error })
  }
}

const getOneRecord = async (recordId) => {
  try {
    winston.verbose(`${className}:getOneRecord:`+
      `recordId:${recordId}`)
    
    const record = await RecordModel.findById(recordId)
      .populate("metadata")
      .exec()

    if (!record)
      throw Error

    winston.debug(`${className}:getOneRecord:`+
      `recordId:${recordId}`)
    winston.verbose(`${className}:getOneRecord:`+
      `recordId:${recordId}:`+
      `record:${record}`)

    return (record)
  } catch (error) {
      throw new customError.RecordError (7, 
        `Error fetching from DB..` +
        `Record id ${recordId} not found`)
  }
}

const createNewRecord = async (data) => {
  try {
    winston.verbose(`${className}:createNewRecord:withData:`+
      `${JSON.stringify(data)}`)

    const record = await RecordModel.create(data)
    if (!record)
      throw new Error

    winston.debug(`${className}:createNewRecord:${record.record.id}`)
    winston.verbose(`${className}:createNewRecord:${record}`)

    if (!record) {
      winston.error(`${className}:createNewRecord:${e}`)
      throw new Error ('Record:createNewRecord:RecordModel creation error')
    }

    return (record)
  } catch (error) {
      throw new customError.RecordCreationError (8, 
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

    let record = await RecordModel.findById(id)
      .populate("metadata")
      .exec()
    
    if (!record) 
      throw new customError.RecordError (6, `Record ${id} not found`)

    let recordMetadata = await RecordMetadataModel.findById(
      record.metadata._id)
    if (!recordMetadata) 
      throw new customError.RecordError (5, `Metadata object` + 
        ` for Record ${id} not found`)

    recordMetadata.attributes[attribute] = data.metadata.attributes[attribute]

    const updatedMetadataRecord = await recordMetadata.save()

    record.timestamps.updatedAt = new Date()
    record.record.doi = updatedMetadataRecord.id
    if (!await record.save())
      throw Error

    winston.debug(`${className}:updateOneRecordAttribute:`+
      `recordId:${id}:`+
      `attribute:${attribute}`)
    winston.verbose(`${className}:updateOneRecordAttribute:`+
      `recordId:${id}`+
      `attribute:${attribute}:`+
      `${updatedMetadataRecord}`)        

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
  createNewRecord,
  updateOneRecordAttribute
}
