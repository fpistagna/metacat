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
		creators: {
			type: [Schema.Types.Mixed],
			required: true
		},
		titles: {
			type: [Schema.Types.Mixed],
			required: true
		},
		publisher: {
			type: Schema.Types.Mixed,
			required: true
		},
		publicationYear: {
			type: Number,
			required: true
		}
	}

})

recordMetadataSchema.pre('save', function (next) {
  this.id = this.attributes.doi
  next()
})

class RecordMetadataModel {
	static model = mongoose.model("RecordMetadata", recordMetadataSchema)

	static async getMetadataById(id) {
		return await this.model.findById(id)
	}

	static async createMetadata(object) {
		try {
			winston.verbose(`${className}:createMetadata:${JSON.stringify(object)}`)
			winston.verbose(`${className}:createMetadata:attributes:`+
				`${JSON.stringify(object.metadata.attributes)}`)

			let recordMetadata = await this.model.create(object.metadata)
			
			winston.debug(`${className}:createMetadata:id:${recordMetadata.id}`)
			winston.verbose(`${className}:createMetadata:${recordMetadata}`)

			return (recordMetadata)
		} catch (e) {
				winston.error(`${className}:createMetadata:${e}`)
				throw new customError.MetadataError (9, e, { cause: e })
		}
	}

	static async updateMetadataAttribute(id, key, value) {
		try {
			winston.verbose(`${className}:updateMetadata:${id}:`+
				`attribute:${key}:`+
				`value:${JSON.stringify(value)}`)
			let m = await this.getMetadataById(id)
			m.attributes[key] = value
			winston.verbose(`${className}:updateMetadata:${JSON.stringify(m)}`)
			return await m.save()
		} catch (e) {
				winston.error(`${className}:updateMetadata:${e}`)
				throw new customError.MetadataError (8, e, { cause: e })
		}
	}
}

module.exports = { RecordMetadataModel }