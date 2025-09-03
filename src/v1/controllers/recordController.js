// In src/controllers/recordController.js

const recordService = require("../services/recordService"),
  className = "recordController",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)
const { withAsyncHandler } = require('../../utils/asyncHandler')
const { withLogging } = require('../../utils/loggerWrapper')

const _records = async (req, res, next) => {
  try {
    if (Object.keys(req.query).length > 0) {
      Logger.logs({ verbose: { query: JSON.stringify(req.query) } })
    
      const result = await recordService.recordByQuery(req.query)
      if (result.length > 0)  res.respond(result)
      else  res.respondNoContent()
    } else {    
      const allRecords = await recordService.records(req.query, req.user)      
      Logger.logs({ debug: { hits: allRecords.length } })
      
      if (!allRecords.length) res.respondNoContent()
      else res.respond({ data: allRecords })
    }
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _record = async (req, res, next) => {
  try {
    const record = await recordService.record(req.params.recordId)

    Logger.logs({ debug: { uuid: record.record.id }, 
      verbose: { record: record } })

    if (!record)
      res.respond({ id: req.params.recordId }, 404)
    else 
      res.respond({
        id: req.params.recordId,
        data: record
      }, 200)
  } catch (error) { 
      Logger.error({ error: error })
      return next(error) 
    }
}

const _recordAttribute = async (req, res, next) => {
  try {
    let rId = req.params.recordId
    let rAttribute = req.params.attribute

    const result = await recordService.recordAttribute(rId, rAttribute)

    Logger.logs({ verbose: { record: result.record } })

    if (!result.record)
      res.respond({ recordId: rId }, 404)
    else if (!result.attribute)
      res.respond({ attribute: rAttribute }, 404)
    else {
      Logger.logs({ debug: { recordId: rId, attribute: rAttribute } })

      res.respond({
        recordId: rId,
        attribute: rAttribute,
        values: result.attribute
      }, 200)
    }
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user)

    Logger.logs({ debug: { recordUuid: record.record.id}, 
      verbose: { record: record } })

    res.respondCreated(record)
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _updateRecord = async (req, res) => {
  try {
    const updatedRecord = recordService.updateRecord(req.body)

    if ( updatedRecord.dbOpStatus === "updated" )
      res.status(201).send({ 
        status: "updated", data: updatedRecord.data })
    else if ( updatedRecord.dbOpStatus === "not found" )
      res.status(404).send({
        status: "error", error: updatedRecord.error})
    else
      res.status(500).send({
        status: "error", error: updatedRecord.error})
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _updateRecordAttribute = async (req, res, next) => {
  try {
    let rId = req.params.recordId,
      rAttribute = req.params.attribute,
      reqBody = req.body

    const updatedRecord = await recordService.updateRecordAttribute(
      rId, rAttribute, reqBody)

    Logger.logs({ debug: { updatedRecord: updatedRecord._id },
      verbose: { updatedRecord: JSON.stringify(updatedRecord)}})

    res.respond({
      recordId: rId,
      attribute: rAttribute,
      status: "updated"
    }, 201)
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _deleteRecord = async (req, res, next) => {
  try{
    const { recordId } = req.params
    await recordService.deleteRecord(recordId)
    res.status(204).send()
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _publishRecord = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const updatedRecord = await recordService.publishRecord(recordId);

    res.respond({
      status: 'success',
      message: 'Record published successfully.',
      data: updatedRecord
    }, 200);
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const records = withAsyncHandler(withLogging(_records, Logger));
const record = withAsyncHandler(withLogging(_record, Logger))
const recordAttribute = withAsyncHandler(withLogging(_recordAttribute, Logger))
const createRecord = withAsyncHandler(withLogging(_createRecord, Logger))
const updateRecord = withAsyncHandler(withLogging(_updateRecord, Logger))
const updateRecordAttribute = withAsyncHandler(withLogging(_updateRecordAttribute, Logger))
const deleteRecord = withAsyncHandler(withLogging(_deleteRecord, Logger))
const publishRecord = withAsyncHandler(withLogging(_publishRecord, Logger))

module.exports = {
  records,
  record,
  recordAttribute,
  createRecord,
  updateRecord,
  updateRecordAttribute,
  deleteRecord,
  publishRecord
}
