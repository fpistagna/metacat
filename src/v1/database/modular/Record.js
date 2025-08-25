const Mongoose = require("./mongoose").connectDB()
const { RecordModel }  = require('./RecordSchema'),
  { RecordMetadataModel } = require('./RecordMetadataSchema'),
  customError = require('../../../utils/customError')

const className = "Mongoose:Model:Record",
  LoggerHelper = require('../../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

const getAllRecords = async () => {
  Logger.callerFunction = 'getAllRecords'
  try {
    const records = await RecordModel.getAllRecords()
    if (!records) {
      throw new customError.RecordError(6,
        `${className}:getAllRecords:Records retrieval failed.`)      
    } else {
      Logger.logs({
        debug: { records: records.length },
        verbose: { records: records }
      })

      return records
    }
  } catch (e) { 
    Logger.error({ error: e })
    throw e 
  }
}

const getRecordByQuery = async (query) => {
  Logger.callerFunction = 'getRecordByQuery'
  try {
    Logger.logs({
      verbose: { query: JSON.stringify(query) }
    })

    const records = await RecordMetadataModel.getRecordByQuery(query)
    return records
  } catch(e) {
      Logger.error( { error: e })
      throw new customError.RecordError (6,
        'Error fetching Records from db using query..', 
        { cause: e })
    }
}

const getOneRecord = async (recordId) => {
  Logger.callerFunction = 'getOneRecord'
  try {
    Logger.logs({
      verbose: { recordId: recordId }
    })

    const record = await RecordModel.getRecordWithId(recordId)
    if (!record) {
      throw new customError.RecordError(7,
        `Record (${recordId}) retrieval failed.`)
    } else {
      Logger.logs({
        debug: { recordId: recordId },
        verbose: { recordId: recordId, record: record }
      })

      return record
    }
  } 
  catch (e) { 
    Logger.error( { error: e })
    throw e 
  }
}

const createNewRecord = async (data) => {
  Logger.callerFunction = 'createNewRecord'
  try {
    Logger.logs({ 
      verbose: { data: JSON.stringify(data) }
    })

    const metadata = await RecordMetadataModel.createMetadata(data)
    const record = await RecordModel.createRecordWithMetadata(metadata)
    if (!record) {
      throw new customError.RecordCreationError(2, 
        'Record creation failed after metadata was saved.')
    } 
    else {
      Logger.logs({
        debug: { recordId: record.record.id },
        verbose: { recordId: record.record.id, record: record }
      })
      return record
    }
  } 
  catch (e) { 
    Logger.error( {error: e })
    throw e 
  }
}

const updateOneRecordAttribute = async(id, attribute, data) => {
  Logger.callerFunction = 'updateOneRecordAttribute'
  try {
    Logger.logs({
      verbose: {
        recordId: id,
        attribute: attribute,
        data: JSON.stringify(data)
      }
    })

    let record = await RecordModel.getRecordWithId(id)
    if (!record) 
      throw new customError.RecordError (6, `Record ${id} not found`)

    const updatedMetadataRecord = await RecordMetadataModel
    .updateMetadataAttribute(
      record.metadata._id,
      attribute,
      data)
      // data.metadata.attributes[attribute])

    Logger.logs({
      verbose: {
        updatedMetadataRecord: updatedMetadataRecord
      }
    })

    if (updatedMetadataRecord) {
      const updatedRecord = await RecordModel.updateRecordMetadata(
        record, 
        updatedMetadataRecord)

      if (!updatedRecord)
        throw new customError.RecordError(8,
          `Record ${record.id} failed to update metadata.`
        )

      Logger.logs({
        debug: {
          recordId: id,
          attribute: attribute
        },
        verbose: {
          recordId: id,
          attribute: attribute,
          updatedMetadataRecord: updatedMetadataRecord,
          record: updatedRecord
        }
      })
    }

    return (updatedMetadataRecord)
  } catch (e) {
      Logger.error( { error: e })
      throw e
  }
}

module.exports = { 
  getAllRecords,
  getOneRecord,
  getRecordByQuery,
  createNewRecord,
  updateOneRecordAttribute
}
