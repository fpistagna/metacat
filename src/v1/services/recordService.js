// In src/services/recordService.js
const Record = require("../database/modular/Record")
const className = "recordService",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)
const { withAsyncHandler } = require('../../utils/asyncHandler')
const { withLogging } = require('../../utils/loggerWrapper')

const _records = async () => {
  const allRecords = await Record.getAllRecords()

  Logger.logs({ debug: { allRecordsCount: allRecords.length },
    verbose: { allRecords: allRecords } })

  return allRecords
}

const _record = async (recordId) => {
  const record = await Record.getOneRecord(recordId)

  Logger.logs({ debug: { recordId: recordId }, 
    verbose: { recordId: recordId, record: record }})

  return record
}

const _recordAttribute = async(id, attribute) => {
  Logger.logs({ debug: { recordId: id, attribute: attribute }})
  const record = await Record.getOneRecord(id)
    
  if (Object.prototype.hasOwnProperty.call(record.metadata.attributes, attribute)) {
    const {[attribute]: attr} = record.metadata.attributes
    return ({ record: record, attribute: attr })
  } else 
    return ({ record: record })
}

const _recordByQuery = async (query) => {
  Logger.logs({ debug: { query: JSON.stringify(query) }})
    
  const records = await Record.getRecordByQuery(query)
    
  Logger.logs({ verbose: { hits: records.length }})
    
  return records
}

const _createRecord = async (data) => {
  Logger.logs({ verbose: { metadata: JSON.stringify(data) }})
    
  let record = await Record.createNewRecord(data)

  Logger.logs({ debug: { uuid: record.record.id, doi: record.record.doi},
    verbose: { record: record }})

  return record
}

const _updateRecord = () => {
  return
}

const _updateRecordAttribute = async (recordId, attribute, data) => {
  Logger.logs({ verbose: { recordId: recordId, attribute: attribute,
    metadata: JSON.stringify(data) } })
    // TODO: Check if attribute is the same as defined in data
  const updatedRecord = await Record.updateOneRecordAttribute(
    recordId, 
    attribute, 
    data)

  Logger.logs({ verbose: { updatedRecord: JSON.stringify(updatedRecord)}})    
  return updatedRecord
}

const _deleteRecord = () => {
  return
}

const records = withAsyncHandler(withLogging(_records, Logger))
const record = withAsyncHandler(withLogging(_record, Logger))
const recordAttribute = withAsyncHandler(withLogging(_recordAttribute, Logger))
const recordByQuery = withAsyncHandler(withLogging(_recordByQuery, Logger))
const createRecord = withAsyncHandler(withLogging(_createRecord, Logger))
const updateRecord = withAsyncHandler(withLogging(_updateRecord, Logger))
const updateRecordAttribute = withAsyncHandler(withLogging(_updateRecordAttribute, Logger))
const deleteRecord = withAsyncHandler(withLogging(_deleteRecord, Logger))

module.exports = {
  records,
  record,
  recordAttribute,
  recordByQuery,
  createRecord,
  updateRecord,
  updateRecordAttribute,
  deleteRecord,
}
