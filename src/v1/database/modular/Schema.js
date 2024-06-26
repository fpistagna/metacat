const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const recordSchema = new Schema({
  record: {
    id: {
      type: String,
      required: true
    },
    doi: String
  },
  timestamps: {
    createdAt: {
      type: Date,
      required: true
    },
    updatedAt: Date,
  },
  metadata: {
    type: Schema.Types.ObjectId,
    ref: 'RecordMetadataAttribute',
    required: true
  }
})

module.exports.RecordSchema = recordSchema;
