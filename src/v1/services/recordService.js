// In src/services/recordService.js
//const Record = require("../database/Record");
const Mongoose = require("../database/modular/mongoose")

const Record = require("../database/modular/Record");
const RecordMetadataAttribute = require("../database/modular/RecordMetadataAttribute");

const { v4: uuid } = require("uuid");

const getAllRecords = async () => {
  try {
    const allRecords = await Record.getAllRecords();
    return allRecords;
  } catch (err) {
      throw new Error (`RecordService:getAllRecords:${err}`, 
        { cause: err })
  }
};

const getOneRecord = async (recordId) => {
  try {
    const record = await Record.getOneRecord(recordId);
    return (record);
  } catch (err) {
      throw new Error (`RecordService:getAllRecords:${err}`, 
        { cause: err })
  }
};

async function _createRecordMetadata(metadata) {
  try {
    const recordMetadata = await RecordMetadataAttribute.createMetadata(metadata)
    return (recordMetadata)
  } catch (err) {
      throw new Error (`RecordService:createRecordMetadata:${err}`, 
        { cause: err })
  }
}

async function _createNewRecord(id, metadata) {
  try {
    return ({
     record: {
       id: uuid(),
       doi: id
     },
     timestamps: {
       createdAt: new Date().toLocaleString("en-US", { timeZone: "UTC" }),
       updatedAt: new Date().toLocaleString("en-US", { timeZone: "UTC" })
     },
     metadata: metadata    
    })
  } catch (err) {
      throw new Error (`RecordService:_createNewRecord:${err}`, { cause: err })
  }
}

const createNewRecord = async (data) => {
  try {
    let recordMetadata = await _createRecordMetadata(data.metadata)
    let newRecord = await _createNewRecord(data.metadata.id, recordMetadata)
    let record = await Record.createNewRecord(newRecord);
    return(record);
  } catch (err) {
      throw new Error (`RecordService:createNewRecord:${err}`, { cause: err })
  }
};

const updateOneRecord = () => {
  return;
};

const updateOneRecordAttribute = async (recordId, attribute, data) => {
  try {
    const updatedRecord = await Record.updateOneRecordAttribute(recordId, attribute, data);
    return (updatedRecord);
  } catch (err) {
      throw new Error (`RecordService:updateRecordAttribute:${err}`, { cause: err })
  }
}

const deleteOneRecord = () => {
  return;
};

module.exports = {
  getAllRecords,
  getOneRecord,
  createNewRecord,
  updateOneRecord,
  updateOneRecordAttribute,
  deleteOneRecord,
};
