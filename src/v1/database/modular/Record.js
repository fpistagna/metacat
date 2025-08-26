const { RecordModel }  = require('./RecordSchema'),
  { RecordMetadataModel } = require('./RecordMetadataSchema'),
  customError = require('../../../utils/customError')

const className = "Model:Record",
  LoggerHelper = require('../../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

const { withAsyncHandler } = require('../../../utils/asyncHandler')
const { withLogging } = require('../../../utils/loggerWrapper')

const _getAllRecords = async () => {
  const records = await RecordModel.records()
  if (!records)
    throw new customError.RecordError(6, `Records retrieval failed.`)
  Logger.logs({
    debug: { records: records.length },
    verbose: { records: records }
  })
  return records
}

const _getRecordByQuery = async (query) => {
  Logger.logs({ verbose: { query: JSON.stringify(query) } })

  const records = await RecordMetadataModel.recordByQuery(query)
  Logger.logs({ debug: { records: records.length }, verbose: { records: records }})
  if (records.length === 0)
    throw new customError.RecordError(9,
      `No Records matching query ${JSON.stringify(query)}`, 
      { query: JSON.stringify(query) })

  return records
}

const _getOneRecord = async (recordId) => {
  Logger.logs({ verbose: { recordId: recordId } })

  const record = await RecordModel.recordWithId(recordId)
  if (!record)
    throw new customError.RecordError(7,
      `Record (${recordId}) retrieval failed.`, { recordId: id })
  Logger.logs({
    debug: { recordId: recordId },
    verbose: { recordId: recordId, record: record }
  })

  return record
}

const createNewRecord = async (data) => {
  Logger.logs({ verbose: { data: JSON.stringify(data) } })

  const metadata = await RecordMetadataModel.createMetadata(data)
  const record = await RecordModel.createRecordWithMetadata(metadata)
  if (!record)
    throw new customError.RecordCreationError(2, 
      'Record creation failed after metadata was saved.')
  Logger.logs({
    debug: { recordId: record.record.id },
    verbose: { recordId: record.record.id, record: record }
  })
  return record
}

const updateOneRecordAttribute = async(id, attribute, data) => {
  Logger.logs({
    verbose: {
      recordId: id,
      attribute: attribute,
      data: JSON.stringify(data)} })

  let record = await RecordModel.recordWithId(id)
  if (!record) 
    throw new customError.RecordError (6, `Record ${id} not found`)

  const updatedMetadataRecord = await RecordMetadataModel
    .updateMetadataAttribute(
      record.metadata._id,
      attribute,
      data)
      // data.metadata.attributes[attribute])

  Logger.logs({ verbose: { updatedMetadataRecord: updatedMetadataRecord } })

  if (updatedMetadataRecord) {
    const updatedRecord = await RecordModel.updateRecordMetadata(
      record, 
      updatedMetadataRecord)

    if (!updatedRecord)
      throw new customError.RecordError(8,
        `Record ${record.id} failed to update metadata.`)

    Logger.logs({ 
      debug: {
        recordId: id,
        attribute: attribute },
      verbose: {
        recordId: id,
        attribute: attribute,
        updatedMetadataRecord: updatedMetadataRecord,
        record: updatedRecord } })
  }

  return (updatedMetadataRecord)
}

const getAllRecords = withAsyncHandler(withLogging(_getAllRecords, Logger));
const getRecordByQuery = withAsyncHandler(withLogging(_getRecordByQuery, Logger));
const getOneRecord = withAsyncHandler(withLogging(_getOneRecord, Logger));

module.exports = { 
  getAllRecords,
  getOneRecord,
  getRecordByQuery,
  createNewRecord,
  updateOneRecordAttribute
}
