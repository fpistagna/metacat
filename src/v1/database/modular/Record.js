const { RecordModel }  = require('./RecordSchema'),
  { RecordMetadataModel } = require('./RecordMetadataSchema'),
  customError = require('../../../utils/customError')

const className = "Model:Record",
  LoggerHelper = require('../../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

const { withAsyncHandler } = require('../../../utils/asyncHandler')
const { withLogging } = require('../../../utils/loggerWrapper')

const _records = async () => {
  const records = await RecordModel.records()
  if (!records)
    throw new customError.RecordError(6, `Records retrieval failed.`)
  Logger.logs({
    debug: { records: records.length },
    verbose: { records: records }
  })
  return records
}

const _recordByQuery = async (query) => {
  Logger.logs({ verbose: { query: JSON.stringify(query) } })

  const records = await RecordMetadataModel.recordByQuery(query)
  Logger.logs({ debug: { records: records.length }, verbose: { records: records }})
  if (records.length === 0)
    throw new customError.RecordError(9,
      `No Records matching query \"${query.q}\".`, 
      { query: query.q })

  return records
}

const _record = async (recordId) => {
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

const _createRecord = async (data, ownerId) => {
  Logger.logs({ verbose: { data: JSON.stringify(data) } })

  const metadata = await RecordMetadataModel.createMetadata(data)
  const record = await RecordModel.createRecordWithMetadata(metadata, ownerId)
  if (!record)
    throw new customError.RecordCreationError(2, 
      'Record creation failed after metadata was saved.')
  Logger.logs({
    debug: { recordId: record.record.id },
    verbose: { recordId: record.record.id, record: record }
  })
  return record
}

const _updateRecordAttribute = async(id, attribute, data) => {
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

const _publishRecord = async (recordId) => {
  return await RecordModel.publishRecord(recordId);
};

const records = withAsyncHandler(withLogging(_records, Logger));
const recordByQuery = withAsyncHandler(withLogging(_recordByQuery, Logger));
const record = withAsyncHandler(withLogging(_record, Logger));
const createRecord = withAsyncHandler(withLogging(_createRecord, Logger));
const updateRecordAttribute = withAsyncHandler(withLogging(_updateRecordAttribute, Logger));
const publishRecord = withAsyncHandler(withLogging(_publishRecord, Logger));

module.exports = { 
  records,
  record,
  recordByQuery,
  createRecord,
  updateRecordAttribute,
  publishRecord
}
