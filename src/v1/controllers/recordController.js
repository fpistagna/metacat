// In src/controllers/recordController.js

const recordService = require("../services/recordService"),
  ajv = require("../services/ajvService")

const getAllRecords = async (req, res) => {
  const allRecords = await recordService.getAllRecords();
  if (!allRecords.length)
    res.status(204).send({ status: "no data" });
  else
    res.status(200).send({ status: "ok", data: allRecords });
};

const getOneRecord = async (req, res) => {
/*  const {
    params: { recordId },
  } = req;
  if (!recordId) {
    return;
  }
  const record = await recordService.getOneRecord(recordId);
  res.status(200).send({ status: "OK", data: record });*/
  
  const record = await recordService.getOneRecord(req.params.recordId);
  if ( !record )
    res.status(404).send({
      status: "not found",
      id: req.params.recordId});
  else 
    res.status(200).send({
      status: "ok", 
      id: req.params.recordId, 
      data: record });
};

const getRecordAttribute = async (req, res) => {
  const record = await recordService.getOneRecord(req.params.recordId);
  if ( !record )
    res.status(404).send({
      status: "not found",
      id: req.params.recordId});
  else {
    if (record.metadata.attributes.hasOwnProperty(req.params.attribute) ) {
      const {[req.params.attribute]: attr} = record.metadata.attributes;
      res.status(200).send({
        status: "ok",
        id: req.params.recordId,
        attribute:  attr});
    } else {
      res.status(404).send({
        status: "not found",
        id: req.params.recordId,
        attribute:  req.params.attribute });
    }
  } 
};

const createNewRecord = async (req, res) => {
  const createdRecord = await recordService.createNewRecord(req.body);

  if ( createdRecord.dbOpStatus === "created" )
    res.status(201).send({ 
      status: "created", data: createdRecord.data });
  else
    res.status(500).send({ 
      status: "error", error: createdRecord.error});
};

const updateOneRecord = async (req, res) => {
  const updatedRecord = recordService.updateOneRecord(req.body);

  if ( updatedRecord.dbOpStatus === "updated" )
    res.status(201).send({ 
      status: "updated", data: updatedRecord.data });
  else if ( updatedRecord.dbOpStatus === "not found" )
    res.status(404).send({
      status: "error", error: updatedRecord.error});
  else
    res.status(500).send({
      status: "error", error: updatedRecord.error});
};

const updateOneRecordAttribute = async (req, res) => {
  const updatedRecord = await recordService.updateOneRecordAttribute(
    req.params.recordId,
    req.params.attribute,
    req.body);

  if ( updatedRecord.dbOpStatus === "updated" )
    res.status(201).send({ 
      status: "updated", data: updatedRecord.data });
  else if ( updatedRecord.dbOpStatus === "not found" )
    res.status(404).send({
      status: "error", error: updatedRecord.error});
  else
    res.status(500).send({
      status: "error", 
      error: updatedRecord.error,
      data: updatedRecord
    });
};

const deleteOneRecord = (req, res) => {
  recordService.deleteOneRecord();
  res.send("Delete an existing record");
};

module.exports = {
  getAllRecords,
  getOneRecord,
  getRecordAttribute,
  createNewRecord,
  updateOneRecord,
  updateOneRecordAttribute,
  deleteOneRecord,
};
