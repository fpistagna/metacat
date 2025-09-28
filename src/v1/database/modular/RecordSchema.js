const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
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
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Indicizzato per ricerche veloci sui record di un utente
  },
  published: {
    type: Boolean,
    default: false,
    required: true
  }
})

recordSchema.plugin(mongoosePaginate)

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

  static async _records(query = {}) { // Accetta un oggetto query opzionale
    let count = await this.model.countDocuments()
    // const records = await this.model.find(query, { limit: 10, sort: { '_id': -1 } }).exec();
    const records = await this.model.find(query)
      .limit(10)
      .sort({ '_id': -1 })
      .exec();
    if (!records)
      throw new customError.RecordError(6, `Get Records failed.`)
    Logger.logs({ verbose: { hits: count, records: records } })
    return records;
  }
  
  static async _recordWithId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Lancia un errore personalizzato per formato non valido
      throw new customError.RecordError(8,
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

  static async _createRecordWithMetadata(md, oid) {
    const r = await this.model.create({ metadata: md, owner: oid })
    if (!r)
      throw new customError.RecordCreationError(1,
        `Failed to create new record \n${r}\n with provided metadata\n${md}.`,
        { mdObj: md })

    Logger.logs({ verbose: { record: r }})
    return r
  }

  static async _updateRecordMetadata(r, m) {
    r.metadata = m
    return await r.save()
  }

  static async _publishRecord(recordId) {
    // Usiamo il metodo che già gestisce la validazione dell'ID e il "not found"
    const record = await this._recordWithId(recordId);

    // Controllo di business logic: non si può ri-pubblicare un record già pubblicato
    if (record.published) {
      throw new customError.RecordError(106, `Record with id ${recordId} is already published.`, 
        { recordId: recordId });
    }

    record.published = true;
    await record.save();

    Logger.logs({ debug: { recordId: recordId, status: 'published' } });
    return record;
  }
}

RecordModel.records = withAsyncHandler(withLogging(RecordModel._records, Logger))
RecordModel.recordWithId = withAsyncHandler(withLogging(RecordModel._recordWithId, Logger))
RecordModel.createRecordWithMetadata = withAsyncHandler(withLogging(RecordModel._createRecordWithMetadata, Logger))
RecordModel.updateRecordMetadata = withAsyncHandler(withLogging(RecordModel._updateRecordMetadata, Logger))
RecordModel.publishRecord = withAsyncHandler(withLogging(RecordModel._publishRecord, Logger))

module.exports.RecordModel = RecordModel