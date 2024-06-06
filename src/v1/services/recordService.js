// In src/services/recordService.js
const Record = require("../database/Record");
const { v4: uuid } = require("uuid");

const getAllRecords = async () => {
  const allRecords = await Record.getAllRecords();
  return allRecords;
};

const getOneRecord = async (recordId) => {
  const record = await Record.getOneRecord(recordId);
  return(record);
};

const createNewRecord = async (data) => {
//  const record = await Record.createNewRecord(data);
  let newRecord = {
    record: {
      id: uuid(),
      doi: data.metadata.id
    },
    timestamps: {
      createdAt: new Date().toLocaleString("en-US", { timeZone: "UTC" }),
      updatedAt: new Date().toLocaleString("en-US", { timeZone: "UTC" })
    },
    metadata: data.metadata    
  }
  const dbOp = await Record.createNewRecord(newRecord);
  return(dbOp);
};

const updateOneRecord = () => {
  return;
};

const updateOneRecordAttribute = async (recordId, attribute, data) => {
  const dbOp = await Record.updateOneRecordAttribute(recordId, attribute, data);
  console.log(dbOp);
  return(dbOp);
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
