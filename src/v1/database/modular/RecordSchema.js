const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const customError = require('../../../utils/customError')
const winston = require('../../../utils/logger')
const className = "Mongoose:Record"
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
    type: Schema.Types.ObjectId,
    ref: 'RecordMetadata',
    required: true
  }
})

recordSchema.pre('save', function (next) {
  now = new Date()
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
    return this.model.find(
          {}, {limit: 10, sort: {'_id': -1}})
          //.populate("metadata")
          .exec()
  }

  static getRecordWithId(id) {
    return this.model.findById(id)
      .populate("metadata")
      .exec()
  }

  static async createRecordWithMetadata(d) {
    try {
      return await this.model.create({metadata: d})  
    } catch (e) {
      winston.error(`${className}:createMetadata:${e}`)
      throw new customError.RecordCreationError (16, e, { cause: e })
    }
    
  }

  static async updateRecordMetadata(r, m) {
    r.metadata = m
    return await r.save()
  }
}

module.exports.RecordModel = RecordModel