const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const customError = require('../../../utils/customError')
const winston = require('../../../utils/logger')
const className = "(Model)RecordMetadata"

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
		winston.verbose(`${className}:createMetadata:${object}`)
		
		let recordMetadata = await RecordMetadataModel.create(object)
		
		winston.debug(`${className}:createMetadata:id:${recordMetadata.id}`)
		winston.verbose(`${className}:createMetadata:${recordMetadata}`)

		return (recordMetadata)
	} catch (error) {
		winston.error(`${className}:createMetadata:${error}`)
		throw new customError.MetadataError (9, error, { cause: error })
	}
}

const getRecordByQuery = async (query) => {
  try {
  	winston.verbose(`${className}:getRecordByQuery:query:${query}`)

    let key = Object.keys(query)[0]
    let value = query[Object.keys(query)[0]]
    let newQuery = {}
    newQuery[key] = value

    const result = await RecordMetadataModel.find(query)
    
    winston.verbose(`${className}:getRecordByQuery:${result}`)
		
		return (result)
  } catch(e) {
  	winston.error(`${className}:getRecordByQuery:${e}`)
    throw new customError.MetadataError (8, error, { cause: error })
  }
}

module.exports = {
	recordMetadataSchema,
	RecordMetadataModel,
	createMetadata,
	getRecordByQuery
}