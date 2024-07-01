const Mongoose = require("./mongoose")

Mongoose.connectDB()
const RecordModel = Mongoose.RecordModel
const RecordMetadataModel = Mongoose.RecordMetadataModel
const customError = require('../../../utils/customError');

const getAllRecords = async () => {
  try {
    const records = await RecordModel.find(
      {}, {limit: 10, sort: {'_id': -1}})
//      .populate("metadata")
      .exec()
    return (records)
  } catch (error) {
      throw new customError.RecordError (7,
        'Error fetching Records from db..', 
        { cause: error })
  }
};

const getOneRecord = async (recordId) => {
  console.log(`DBG:Record:getOneRecord:\n ${JSON.stringify(recordId)}`)
  try {
    const record = await RecordModel.findById(recordId)
      .populate("metadata")
      .exec()
    return (record)
  } catch (error) {
      throw new customError.RecordError (7, 
        `Error fetching from DB..Record id ${recordId} not found`)
  }
}

const createNewRecord = async (data) => {
  console.log(`DBG:Record:createNewRecord:\n ${JSON.stringify(data)}`)
  try {
    const record = await RecordModel.create(data)
    if (!record)
      throw new Error ('Record:createNewRecord:RecordModel creation error')
    return (record)
  } catch (error) {
      throw new customError.RecordCreationError (8, error, { cause: error })
  }
}

const updateOneRecordAttribute = async(id, attribute, data) => {
  console.log(`DBG:Record:updateRecordAttribute:\n\
    ${attribute} - ${JSON.stringify(data)}`)
  try {
    let record = await RecordModel.findById(id)
      .populate("metadata")
      .exec()
    
    console.log(`DBG:Record Metadata _ID: ${record.metadata._id}`)
    
    let recordMetadata = await RecordMetadataModel.findById(
      record.metadata._id)

    console.log(`DBG:\n FOUND ${record.metadata._id}\n\n\
      document:${recordMetadata}\n`)

    recordMetadata.attributes[attribute] = data.metadata.attributes[attribute]

    const updatedMetadataRecord = await recordMetadata.save()
    console.log(`DBG:Updated Record Metadata:\
     ${JSON.stringify(updatedMetadataRecord)}`)

    return (updatedMetadataRecord)
  } catch (error) { 
      throw new customError.RecordError (7, error, { cause: error })
  }
}

module.exports = { 
  getAllRecords,
  getOneRecord,
  createNewRecord,
  updateOneRecordAttribute
}
