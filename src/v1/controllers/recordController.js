// In src/controllers/recordController.js

const recordService = require("../services/recordService"),
  className = "recordController",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

const getAllRecords = async (req, res, next) => {
  Logger.callerFunction = 'getAllRecords'
  try {
    if (Object.keys(req.query).length > 0) {
      Logger.logs({ verbose: { query: req.query } })
      
      const result = await recordService.getRecordByQuery(req.query)
      if (result.length > 0)
        res.respond(result)
      else
        res.respondNoContent()
    } else {
      const allRecords = await recordService.getAllRecords()      
      Logger.logs({ debug: { hits: allRecords.length } })
      
      if (!allRecords.length)
        res.respondNoContent()
      else
        res.respond(allRecords)
    }
  } catch (error) {
      Logger.error({ error: error })
      return next(error)
    }
}

const getOneRecord = async (req, res, next) => {
  Logger.callerFunction = 'getOneRecord'
  try {
    const record = await recordService.getOneRecord(req.params.recordId)

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

const getRecordAttribute = async (req, res, next) => {
  Logger.callerFunction = 'getRecordAttribute'
  try {
    let rId = req.params.recordId
    let rAttribute = req.params.attribute

    const result = await recordService.getRecordAttribute(rId, rAttribute)

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

const createNewRecord = async (req, res, next) => {
  Logger.callerFunction = 'createNewRecord'
  try {
    const record = await recordService.createNewRecord(req.body)

    Logger.logs({ debug: { recordUuid: record.record.id}, 
      verbose: { record: record } })

    res.respondCreated(record)
  }
  catch (error) { 
    Logger.logs({ error: error })
    return next(error) }
}

const updateOneRecord = async (req, res) => {
  const updatedRecord = recordService.updateOneRecord(req.body)

  if ( updatedRecord.dbOpStatus === "updated" )
    res.status(201).send({ 
      status: "updated", data: updatedRecord.data })
  else if ( updatedRecord.dbOpStatus === "not found" )
    res.status(404).send({
      status: "error", error: updatedRecord.error})
  else
    res.status(500).send({
      status: "error", error: updatedRecord.error})
}

const updateOneRecordAttribute = async (req, res, next) => {
  Logger.callerFunction = 'updateOneRecordAttribute'
  try {
    let rId = req.params.recordId,
      rAttribute = req.params.attribute,
      reqBody = req.body

    const updatedRecord = await recordService.updateOneRecordAttribute(
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

const deleteOneRecord = (req, res) => {
  recordService.deleteOneRecord()
  res.send("Delete an existing record")
}

module.exports = {
  getAllRecords,
  getOneRecord,
  getRecordAttribute,
  createNewRecord,
  updateOneRecord,
  updateOneRecordAttribute,
  deleteOneRecord,
}
