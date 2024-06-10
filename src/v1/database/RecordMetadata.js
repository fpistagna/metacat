const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const recordMetadataSchema = new Schema({
	attributes: {
		type: Schema.Types.ObjectId,
		ref: 'RecordMetadataAttribute'
		required: true
	},
	record: {
		type: Schema.Types.ObjectId,
		ref: 'RecordSchema',
		required: true
	}
})

module.exports = mongoose.model(
	'RecordMetadata', recordMetadataSchema);
