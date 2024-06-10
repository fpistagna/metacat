const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const recordMetadataAttributeSchema = new Schema({
	doi: {
		type: String,
		required: true
	},
	identifiers: [{
		type: Schema.Types.ObjectId,
		ref: 'Identifier'
		required: true
	}],
	creators: [{
		type: Schema.Types.ObjectId,
		ref: 'Creator'
		required: true
	}],
	titles: [{
		type: Schema.Types.ObjectId,
		ref: 'Title'
		required: true
	}],
	publisher: {
		type: Schema.Types.ObjectId,
		ref: 'Publisher'
		required: true
	},
	publicationYear: {
		type: Number,
		required: true
	},
	record: {
		type: Schema.Types.ObjectId,
		ref: 'RecordSchema',
		required: true
	}
})

module.exports = mongoose.model(
	'RecordMetadataAttribute', recordMetadataAttributeSchema);
