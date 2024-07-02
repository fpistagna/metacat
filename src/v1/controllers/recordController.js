// In src/controllers/recordController.js

const recordService = require("../services/recordService"),
  ajv = require("../services/ajvService")
/* ### Controller functions ### */

const getAllRecords = async (req, res, next) => {
  try {
    if (Object.keys(req.query).length > 0) {
      console.log(req.query)
      const result = await recordService.getRecordByQuery(req.query)
      res.respond(result)
    } else {
      const allRecords = await recordService.getAllRecords()
      if (!allRecords.length)
        res.respondNoContent()
      else
        res.respond(allRecords)
    }
  } catch (error) { return next(error) }
}

const getOneRecord = async (req, res, next) => {
  try {
    const record = await recordService.getOneRecord(req.params.recordId)
    if (!record)
      res.respond({ id: req.params.recordId }, 404)
    else 
      res.respond({
        id: req.params.recordId,
        data: record
      }, 200)
  } catch (error) { return next(error) }
}

const getRecordAttribute = async (req, res, next) => {
  try {
    const record = await recordService.getOneRecord(req.params.recordId)
    if (!record)
      res.respond({ recordId: req.params.recordId }, 404)
    else {
      if (record.metadata.attributes.hasOwnProperty(req.params.attribute) ) {
        const {[req.params.attribute]: attr} = record.metadata.attributes
        res.respond({
          recordId: req.params.recordId,
          attribute: attr
        }, 200)
      } else 
        res.respond({ 
          recordId: req.params.recordId,
          message: "attribute not found"
        }, 404)
    }
  } catch (error) { return next(error) } 
}

const createNewRecord = async (req, res, next) => {
  try {
    const record = await recordService.createNewRecord(req.body)
    res.respondCreated(record)
  }
  catch (error) { return next(error) }
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
  try {
    const updatedRecord = await recordService.updateOneRecordAttribute(
      req.params.recordId,
      req.params.attribute,
      req.body)

    res.respond({
      recordId: req.params.recordId,
      attribute: req.params.attribute,
      status: "updated"
    }, 201)
/*    if ( updatedRecord )
      res.status(201).send({ 
        status: "updated", data: updatedRecord.data })
    else 
      res.status(404).send({
        status: "error", error: `${req.params.recordId} not found`})*/
    } catch (error) { return next(error) }
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
