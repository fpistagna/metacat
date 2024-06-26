const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const customError = require('../../../utils/customError');

const recordMetadataAttributeSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	type: {
		type: String,
		required: true
	},

	attributes: {
		doi: {
			type: String,
			required: true
		},

		identifiers: {
			type: [Schema.Types.Mixed],
			required: true
		},
	/*	identifiers: [{
			type: Schema.Types.ObjectId,
			ref: 'Identifier',
			required: true
		}],*/

		creators: {
			type: [Schema.Types.Mixed],
			required: true
		},
	/*	creators: [{
			type: Schema.Types.ObjectId,
			ref: 'Creator',
			required: true
		}],*/

		titles: {
			type: [Schema.Types.Mixed],
			required: true
		},
	/*	titles: [{
			type: Schema.Types.ObjectId,
			ref: 'Title',
			required: true
		}],*/

		publisher: {
			type: Schema.Types.Mixed,
			required: true
		},
	/*	publisher: {
			type: Schema.Types.ObjectId,
			ref: 'Publisher',
			required: true
		},*/

		publicationYear: {
			type: Number,
			required: true
		}/*,
		record: {
			type: Schema.Types.ObjectId,
			ref: 'RecordSchema',
			required: true
		}*/
	}

})

const RecordMetadataAttributeModel = mongoose.model("RecordMetadataAttribute", recordMetadataAttributeSchema);

const createMetadata = async (object) => {
	try {
		console.log("DBG:RecordMetadataAttribute:createMetadata");
		console.log(object);
		let recordMetadata = await RecordMetadataAttributeModel.create(object);
		return (recordMetadata);
	} catch (error) {
		throw new customError.MetadataError (9, error, { cause: error });
	}
}

module.exports = {
	recordMetadataAttributeSchema,
	createMetadata
}