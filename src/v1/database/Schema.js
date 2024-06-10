const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const recordSchema = new Schema({
	record: {
		type: Schema.Types.ObjectId,
		ref: 'recordIds'
	},
	timestamps: {
		type: Schema.Types.ObjectId,
		ref: 'recordTimestamps'
	},
	metadata: {
		type: Schema.Types.ObjectId,
		ref: 'recordMetadata'
	}
})

module.exports = mongoose.model('RecordSchema', recordSchema);
