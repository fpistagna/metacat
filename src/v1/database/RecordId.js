const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const recordIdSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	doi: String,
	record: {
		type: Schema.Types.ObjectId,
		ref: 'RecordSchema',
		required: true
	}
})

module.exports = mongoose.model('RecordIds', recordIdSchema);
