const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const recordTimestampSchema = new Schema({
	createdAt: {
		type: Date,
		required: true
	},
	updatedAt: Date,
	record: {
		type: Schema.Types.ObjectId,
		ref: 'RecordSchema',
		required: true
	}
})

module.exports = mongoose.model('RecordTimestamps', recordTimestampSchema);
