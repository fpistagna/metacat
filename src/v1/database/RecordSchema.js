const mongoose = require('mongoose');

module.exports.RecordSchema = mongoose.Schema({
  "record": {
    "id": {
      "type": "String",
      "required": true
    },
    "doi": {
      "type": "String"
    }
  },
  "timestamps": {
    "createdAt": {
      "type": "Date"
    },
    "updatedAt": {
      "type": "Date"
    }
  },
  "metadata": {
    "attributes": {
      "doi": {
        "type": "String"
      },
      "identifiers": {
        "type": [ "Mixed" ],
        "required": true
      },
      "creators": {
        "type": [ "Mixed" ],
        "required": true
      },
      "titles": {
        "type": [ "Mixed" ],
        "required": true
      },
      "publisher": {
        "lang": {
          "type": "String"
        },
        "name": {
          "type": "String"
        },
        "schemeUri": {
          "type": "String"
        },
        "publisherIdentifierScheme": {
          "type": "String"
        }
      },
      "publicationYear": {
        "type": "Number",
        "required": true
      },
    }
  }
})