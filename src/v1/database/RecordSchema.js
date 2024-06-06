const mongoose = require('mongoose');

module.exports.RecordSchema = mongoose.Schema({
  "record": {
    "id": {
      "type": "String"
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
        "type": [
          "Mixed"
        ]
      },
      "creators": {
        "type": [
          "Mixed"
        ]
      },
      "titles": {
        "type": [
          "Mixed"
        ]
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
        "type": "Number"
      }
    }
  }
})