const Mongoose = require("./mongoose")

Mongoose.connectDB()
const RecordModel = Mongoose.RecordModel

const getAllRecords = async () => {
  try {
    const records = await RecordModel.find(
      {}, {limit: 10, sort: {'_id': -1}})
    return (records)
  } catch (error) {
    return (error)
  }
};

const getOneRecord = async (recordId) => {
  try {
    const record = await RecordModel.findById(recordId).exec()
    console.log(record)
    return (record)
  } catch (error) {
    return (error)
  }
}

const createNewRecord = async (data) => {
  try {
    const record = await RecordModel.create(data)
    return ({
      dbOpStatus: "created",
      data: record })
    return (record)
  } catch (error) {
      throw {
        dbOpStatus: "error",
        error: error?.message || error
      }
    /*return({
      dbOpStatus: "error",
      error: error })
  }*/
  }
}

const updateOneRecordAttribute = async(id, attribute, data) => {
  try {
    let record = await RecordModel.findById(id);
    record.metadata.attributes[attribute] = data.metadata.attributes[attribute];
    const updatedRecord = await RecordModel.create(record);
    return ({
      dbOpStatus: "updated",
      id: id,
      attribute: attribute,
      data: updatedRecord
    }) 
  } catch (error) { 
      throw {
        dbOpStatus: "db operation error",
        error: error?.message || error
      }
  }
}

module.exports = { 
  getAllRecords,
  getOneRecord,
  createNewRecord,
  updateOneRecordAttribute
};
