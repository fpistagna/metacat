const mongoose = require('mongoose')
const { Schema } = require('mongoose')

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

// Sets the createdAt parameter equal to the current time
recordSchema.pre('save', function (next) {
  now = new Date()
  if(!this.timestamps.createdAt)
    this.timestamps.createdAt = now

  this.timestamps.updatedAt = now
  this.record.id = uuid()
  this.record.doi = this.metadata.id

  next()
})

module.exports.RecordModel = mongoose.model("Record", recordSchema);