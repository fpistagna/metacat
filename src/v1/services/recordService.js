// In src/services/recordService.js
const Record = require("../database/modular/Record")
const className = "recordService",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

const getAllRecords = async () => {
  Logger.callerFunction = 'getAllRecords'
  try {
    const allRecords = await Record.getAllRecords()

    Logger.logs({ debug: { allRecordsCount: allRecords.length },
      verbose: { allRecords: allRecords } })

    return allRecords
  } catch (e) {
      Logger.error({ error: e })
      throw e
  }
}

const getOneRecord = async (recordId) => {
  Logger.callerFunction = 'getOneRecord'
  try {
    const record = await Record.getOneRecord(recordId)

    Logger.logs({ debug: { recordId: recordId }, 
      verbose: { recordId: recordId, record: record }})

    return (record)
  } catch (e) {
      Logger.error({ error: e })
      throw e
  }
}

const getRecordAttribute = async(id, attribute) => {
  Logger.callerFunction = 'getRecordAttribute'
  try {
    Logger.logs({ debug: { recordId: id, attribute: attribute }})
    const record = await Record.getOneRecord(id)
    
    if (Object.prototype.hasOwnProperty.call(record.metadata.attributes, attribute)) {
      const {[attribute]: attr} = record.metadata.attributes
      return ({ record: record, attribute: attr })
    } else
      return ({ record: record } )

  } catch (e) {
      Logger.error({ error: e })
      throw e
  }
}

const getRecordByQuery = async (query) => {
  Logger.callerFunction = 'getRecordByQuery'
  try {
    Logger.logs({ debug: { query: JSON.stringify(query) }})
    
    const records = await Record.getRecordByQuery(query)
    
    Logger.logs({ verbose: { hits: records.length }})
    
    return (records)
  } catch (e) {
      Logger.error({ error: e })
      throw e
  }
}

const createNewRecord = async (data) => {
  Logger.callerFunction = 'createNewRecord'
  try {
    Logger.logs({ verbose: { metadata: JSON.stringify(data) }})
    
    let record = await Record.createNewRecord(data)

    Logger.logs({ debug: { uuid: record.record.id, doi: record.record.doi},
      verbose: { record: record }})

    return(record)
  } catch (e) { 
      Logger.error({ error: e })
      throw e 
    }
}

const updateOneRecord = () => {
  return
}

const updateOneRecordAttribute = async (recordId, attribute, data) => {
  Logger.callerFunction = 'updateOneRecordAttribute'
  try {
    Logger.logs({ verbose: { recordId: recordId, attribute: attribute,
      metadata: JSON.stringify(data) } })
    // TODO: Check if attribute is the same as defined in data
    const updatedRecord = await Record.updateOneRecordAttribute(
      recordId, 
      attribute, 
      data)

    Logger.logs({ verbose: { updatedRecord: JSON.stringify(updatedRecord)}})    
    return (updatedRecord)
  } catch (e) {
      Logger.error({ error: e })
      throw e
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
