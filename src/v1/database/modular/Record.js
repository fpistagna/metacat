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
      .populate("metadata")
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
      `recordId:${recordId}:`)
    
    const record = await RecordModel.findById(recordId)
      .populate("metadata")
      .exec()

    winston.debug(`${className}:getOneRecord:`+
      `recordId:${recordId}`)
    winston.verbose(`${className}:getOneRecord:`+
      `recordId:${recordId}:`+
      `record:${record}`)

    return (record)
  } catch (error) {
      throw new customError.RecordError (7, 
        `Error fetching from DB..Record id ${recordId} not found`)
  }
}

const createNewRecord = async (data) => {
  try {
    const record = await RecordModel.create(data)

    winston.debug(`${className}:createNewRecord:${record.record.id}`)
    winston.verbose(`${className}:createNewRecord:${record}`)

    if (!record) {
      winston.error(`${className}:createNewRecord:${e}`)
      throw new Error ('Record:createNewRecord:RecordModel creation error')
    }

    return (record)
  } catch (error) {
      throw new customError.RecordCreationError (8, error, { cause: error })
  }
}

const updateOneRecordAttribute = async(id, attribute, data) => {
  try {
    winston.verbose(`${className}:updateOneRecordAttribute:`+
      `recordId:${id}:`+
      `attribute:${attribute}:`+
      `data:${data}`)

    let record = await RecordModel.findById(id)
      .populate("metadata")
      .exec()
    
    let recordMetadata = await RecordMetadataModel.findById(
      record.metadata._id)

    recordMetadata.attributes[attribute] = data.metadata.attributes[attribute]

    const updatedMetadataRecord = await recordMetadata.save()

    winston.debug(`${className}:updateOneRecordAttribute:`+
      `recordId:${id}:`+
      `attribute:${attribute}`)
    winston.verbose(`${className}:updateOneRecordAttribute:`+
      `recordId:${id}`+
      `attribute:${attribute}:`+
      `${updatedMetadataRecord}`)

    return (updatedMetadataRecord)
  } catch (error) { 
      throw new customError.RecordError (7, error, { cause: error })
  }
}

module.exports = { 
  getAllRecords,
  getOneRecord,
  createNewRecord,
  updateOneRecordAttribute
}
