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

  static async getAllRecords() {
    Logger.callerFunction = 'getAllRecords'
    try {
      let records = await this.model.find(
        {}, { limit: 10, sort: { '_id': -1 } })
        //.populate("metadata")
        .exec()
      if (!records)
        throw new customError.RecordError(6,
          `Get Records failed.`, { cause: e })
      Logger.logs({ verbose: { records: records.count } })

      return records
    } catch (e) {
      Logger.error({ error: e })
      throw e
    }
  }

  static async getRecordWithId(id) {
    Logger.callerFunction = 'getRecordWithId'
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // Lancia un errore personalizzato per formato non valido
        throw new customError.RecordError(8, // -> Ti suggerisco un nuovo codice di errore
          `The provided ID '${id}' has an invalid format.`, { recordId: id });
      }
      let record = await this.model.findById(id).populate("metadata").exec()
      if (!record)
        // Lancia l'errore personalizzato per record non trovato
        throw new customError.RecordError(7,
          `No Record found with id ${id}`, { recordId: id })

      Logger.logs({ verbose: { record: record } })
      return record
    } catch (e) {
      Logger.error({ error: e })
      throw e
    }
  }

  static async createRecordWithMetadata(md) {
    Logger.callerFunction = 'createRecordWithMetadata'
    try {
      let r = await this.model.create({ metadata: md })
      if (!r)
        throw new customError.RecordCreationError(1,
          `Failed to create new record \n${r}\n with provided metadata\n${md}.`,
          { mdObj: md })
      
      return r
      return await this.model.create({metadata: md})  
    } catch (e) {
      Logger.error({ error: e }) 
      throw e
    }
  }

  static async updateRecordMetadata(r, m) {
    r.metadata = m
    return await r.save()
  }
}

module.exports.RecordModel = RecordModel