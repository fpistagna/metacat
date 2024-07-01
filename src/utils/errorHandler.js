// errorHandler.js
const errorHandler = (error, req, res, next) => {

  console.log(`errorHandler: ${error}`); // logging the error here

  switch (error.name) {
    case "RecordError": {
      switch(error.code) {

        case 7:
          return res.status(404).send({
            type: error.name,
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
        case 8:
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
        default: { }
      }  
    }

    case "MetadataError": {
      switch(error.code) {
        case 9:
          return res.status(400).send({
            type: error.name,
            details: error.toString()
          })
        default: { }
      }  
    }

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