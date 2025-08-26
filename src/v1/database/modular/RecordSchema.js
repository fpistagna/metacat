const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const customError = require('../../../utils/customError')
const className = "Mongoose:RecordModel",
  LoggerHelper = require('../../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)
const { withAsyncHandler } = require('../../../utils/asyncHandler')
const { withLogging } = require('../../../utils/loggerWrapper')
const { v4: uuid } = require("uuid")

const recordSchema = new Schema({
  record: {
    id: {
      type: String,
      default: '<record uuid>',
      required: true
    },
    doi: String
  },
  timestamps: {
    createdAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    updatedAt: Date,
  },
  metadata: {
    // type: Schema.Types.ObjectId,
    type: String,
    ref: 'RecordMetadata',
    required: true
  }
})

recordSchema.pre('save', function (next) {
  let now = new Date()
  if(!this.timestamps.createdAt)
    this.timestamps.createdAt = now

  this.timestamps.updatedAt = now
  
  if(typeof this.record.id === 'string' &&  this.record.id === '<record uuid>')
    this.record.id = uuid()
    
  this.record.doi = this.metadata.id

  next()
})

class RecordModel {

  static model = mongoose.model("Record", recordSchema)

  static async _records() {
    let count = await this.model.countDocuments()
    let records = await this.model.find(
      {}, { limit: 10, sort: { '_id': -1 } })
      //.populate("metadata")
      .exec()
    if (!records)
      throw new customError.RecordError(6, `Get Records failed.`)
    Logger.logs({ verbose: { hits: count, records: records } })
    return records
  }

  static async _recordWithId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Lancia un errore personalizzato per formato non valido
      throw new customError.RecordError(8, // -> Ti suggerisco un nuovo codice di errore
        `The provided ID '${id}' has an invalid format.`, { recordId: id })
    }
    let record = await this.model.findById(id).populate("metadata").exec()
    if (!record)
      // Lancia l'errore personalizzato per record non trovato
      throw new customError.RecordError(7,
        `No Record found with id ${id}`, { recordId: id })

    Logger.logs({ verbose: { record: record } })
    return record
  }

  static async _createRecordWithMetadata(md) {
    let r = await this.model.create({ metadata: md })
    if (!r)
      throw new customError.RecordCreationError(1,
        `Failed to create new record \n${r}\n with provided metadata\n${md}.`,
        { mdObj: md })
      
    return r
  }

  static async _updateRecordMetadata(r, m) {
    r.metadata = m
    return await r.save()
  }
}

RecordModel.records = withAsyncHandler(withLogging(RecordModel._records, Logger))
RecordModel.recordWithId = withAsyncHandler(withLogging(RecordModel._recordWithId, Logger))
RecordModel.createRecordWithMetadata = withAsyncHandler(withLogging(RecordModel._createRecordWithMetadata, Logger))
RecordModel.updateRecordMetadata = withAsyncHandler(withLogging(RecordModel._updateRecordMetadata, Logger))

module.exports.RecordModel = RecordModel