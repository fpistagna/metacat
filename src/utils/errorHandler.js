// errorHandler.js
const winston = require('./logger'),
  className = "errorHandler"

const errorHandler = (error, req, res) => {
  winston.error(`${className}:${error}\n${error.stack}`) // logging the error here

  switch (error.name) {
    case "RecordError": {
      switch(error.code) {

        case 6:
          return res.status(404).send({
            type: error.name,
            errorCode: error.code,
            details: error.toString()
          })
        case 7:
          return res.status(404).send({
            type: error.name,
            errorCode: error.code,
            details: error.toString()
          })
        default: {
          return res.status(500).send({
            type: error.name,
            details: error.toString()
          })
        }
      }
    }

    case "RecordCreationError": {
      switch(error.code) {
        case 17:
          return res.status(400).send({
            type: error.name,
            details: error.toString()
          })

        case 18:
          return res.status(400).send({
            type: error.name,
            details: error.toString()
          })

        case 19:
          return res.status(400).send({
            type: error.name,
            details: error.toString()
          })
        default: { /* empty */ }
      }
    }
    break

    case "MetadataError": {
      switch(error.code) {
        case 6:
          return res.status(422).send({
            type: error.name,
            details: error.toString()
          })
        case 7:
          return res.status(400).send({
            type: error.name,
            details: error.toString()
          })
        case 9:
          return res.status(400).send({
            type: error.name,
            details: error.toString()
          })
        default: { /* empty */ }
      }
    }
    break

    default: {
      console.log(`DBG:ERROR_HANDLER`)
      return res.status(500).send({
        type: error.name,
        details: error.toString()
      })
    }
  }
};

module.exports = errorHandler;