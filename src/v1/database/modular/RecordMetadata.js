const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const customError = require('../../../utils/customError')

const recordMetadataSchema = new Schema({
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

const RecordMetadataModel = mongoose.model("RecordMetadata", recordMetadataSchema)

const createMetadata = async (object) => {
	try {
		console.log("DBG:RecordMetadata:createMetadata")
		console.log(object)
		let recordMetadata = await RecordMetadataModel.create(object)
		return (recordMetadata)
	} catch (error) {
		console.log(`DBG:RecordMetadata:createMetadata:${error}`)
		throw new customError.MetadataError (9, error, { cause: error })
	}
}

const getRecordByQuery = async (query) => {
  try {
    console.log(query)
    let key = Object.keys(query)[0]
    let value = query[Object.keys(query)[0]]
    let newQuery = {}
    newQuery[key] = value
    console.log("newQuery")
    console.log(newQuery)
    const result = await RecordMetadataModel.find(query)
    console.log(result)
    return (result)
  } catch(e) {
    console.log(e)
  }
}

module.exports = {
	recordMetadataSchema,
	createMetadata,
	getRecordByQuery
}