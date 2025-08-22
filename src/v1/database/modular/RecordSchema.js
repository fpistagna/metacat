const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const customError = require('../../../utils/customError')
const className = "Mongoose:RecordModel",
  LoggerHelper = require('../../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)
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

//module.exports.RecordModel = mongoose.model("Record", recordSchema);

class RecordModel {

  static model = mongoose.model("Record", recordSchema)

  static getAllRecords() {
    Logger.callerFunction = 'getAllRecords'
    try {
      return this.model.find(
        {}, { limit: 10, sort: { '_id': -1 } })
        //.populate("metadata")
        .exec()
    } catch (e) {
      Logger.error({ error: e })
      throw new customError.RecordError(
        6, 
        `${className}:getAllRecords:${e.message}`, 
        { cause: e })
    }
  }

  static async getRecordWithId(id) {
    Logger.callerFunction = 'getRecordWithId'
    try {
      let record = await this.model.findById(id).populate("metadata").exec()
      
      Logger.logs({ verbose: { record: record } })

      return record
    } catch (e) {
      Logger.error({ error: e })
      throw new customError.RecordError(
        7, 
        `${className}:getRecordWithId:${e.message}`, 
        { cause: e })
    }
  }

  static async createRecordWithMetadata(d) {
    Logger.callerFunction = 'createRecordWithMetadata'
    try {
      return await this.model.create({metadata: d})  
    } catch (e) {
      Logger.error({ error: e }) 
      throw new customError.RecordCreationError (
        1, 
        `${className}:createRecordWithMetadata:${e.message}`, 
        { cause: e })
    }
  }

  static async updateRecordMetadata(r, m) {
    r.metadata = m
    return await r.save()
  }
}

module.exports.RecordModel = RecordModel