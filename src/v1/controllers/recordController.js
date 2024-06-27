// In src/controllers/recordController.js

const recordService = require("../services/recordService"),
  ajv = require("../services/ajvService")

/* ### Controller functions ### */

const getAllRecords = async (req, res, next) => {
  try {
    if (Object.keys(req.query).length > 0) {
      console.log(req.query)
      const result = await recordService.getRecordByQuery(req.query)
      res.status(200).send({ status: "ok", data: result })
    } else {
      const allRecords = await recordService.getAllRecords()
      if (!allRecords.length)
        res.status(204).send({ status: "no data" })
      else
        res.status(200).send({ status: "ok", data: allRecords })
    }
  } catch (error) { return next(error) }
}

const getOneRecord = async (req, res, next) => {
  try {
    const record = await recordService.getOneRecord(req.params.recordId)
    if ( !record )
      res.status(404).send({
        status: "not found",
        id: req.params.recordId})
    else 
      res.status(200).send({
        status: "ok", 
        id: req.params.recordId, 
        data: record })
  } catch (error) { return next(error) }
}

const getRecordAttribute = async (req, res) => {
  try {
    const record = await recordService.getOneRecord(req.params.recordId)
    if ( !record )
      res.status(404).send({
        status: "not found",
        id: req.params.recordId})
    else {
      if (record.metadata.attributes.hasOwnProperty(req.params.attribute) ) {
        const {[req.params.attribute]: attr} = record.metadata.attributes
        res.status(200).send({
          status: "ok",
          id: req.params.recordId,
          attribute:  attr})
      } else {
        res.status(404).send({
          status: "not found",
          id: req.params.recordId,
          attribute:  req.params.attribute })
      }
    }
  } catch (error) { return next(error) } 
}

const createNewRecord = async (req, res, next) => {
  try {
    const record = await recordService.createNewRecord(req.body)

    if (record)
      res.status(201).send({ 
        status: "created", data: record })
    else
      res.status(500).send({ 
        status: "error", error: record})
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

    if ( updatedRecord )
      res.status(201).send({ 
        status: "updated", data: updatedRecord.data })
    else 
      res.status(404).send({
        status: "error", error: `${req.params.recordId} not found`})    
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
