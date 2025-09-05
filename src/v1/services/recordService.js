// In src/services/recordService.js
const Record = require("../database/modular/Record")
const className = "recordService",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className),
  customError = require('../../utils/customError')
const { withAsyncHandler } = require('../../utils/asyncHandler')
const { withLogging } = require('../../utils/loggerWrapper')

// const _records = async () => {
//   const allRecords = await Record.records()

//   Logger.logs({ debug: { allRecordsCount: allRecords.length },
//     verbose: { allRecords: allRecords } })

//   return allRecords
// }

const _records = async (queryParams, user) => {
  // 1. Definiamo la query di base: solo record pubblicati
  const query = { published: true };

  // 2. Se un utente è loggato, modifichiamo la query
  if (user) {
    // Admin e Curator possono vedere tutto (a meno che non filtrino diversamente)
    if (['admin', 'curator'].includes(user.role)) {
      // Se non c'è un filtro specifico `published` nella querystring, non filtriamo per stato
      if (queryParams.published === undefined) {
        delete query.published;
      }
    } else {
      // Un 'user' normale vede i record pubblicati O le proprie bozze
      query.$or = [
        { published: true },
        { owner: user.id, published: false }
      ];
      delete query.published; // Rimuoviamo la condizione base perché ora è gestita da $or
    }
  }

  // Aggiungi qui la logica per la ricerca full-text se presente
  if (queryParams.q) {
    query.$text = { $search: queryParams.q };
  }

  const allRecords = await Record.records(query); // Passiamo la query al DAO
  return allRecords;
};

const _record = async (recordId, user) => {
  const record = await Record.record(recordId)

  Logger.logs({ debug: { recordId: recordId }, 
    verbose: { recordId: recordId, record: record }})
  
  if (record.published) 
    return record

  if (!user)
    // Se non è pubblicato e non c'è utente via token, accesso negato
    throw new customError.UserError(33, 
      `Record id ${recordId} is not published (${record.published}) ` +
      `and No correct token provided. Authorization denied.`)
  
  const isOwner = record.owner.toString() === user.id
  const isPrivileged = ['admin', 'curator'].includes(user.role)

  if (isOwner || isPrivileged)
    return record // Se è il proprietario o un curatore/admin, può vederlo

  // Se l'utente è loggato ma non ha i permessi, accesso negato
  throw new customError.UserError(40, 
    'Forbidden: no permissions to view this resource.')
}

const _recordAttribute = async(id, attribute) => {
  Logger.logs({ debug: { recordId: id, attribute: attribute }})
  const record = await Record.record(id)
    
  if (Object.prototype.hasOwnProperty.call(record.metadata.attributes, attribute)) {
    const {[attribute]: attr} = record.metadata.attributes
    return ({ record: record, attribute: attr })
  } else 
    return ({ record: record })
}

const _recordByQuery = async (query) => {
  Logger.logs({ debug: { query: JSON.stringify(query) }})
    
  const records = await Record.recordByQuery(query)
    
  Logger.logs({ verbose: { hits: records.length }})
    
  return records
}

const _createRecord = async (data, user) => {
  Logger.logs({ verbose: { metadata: JSON.stringify(data) }})

  const ownerId = user.id;
  const record = await Record.createRecord(data, ownerId)

  Logger.logs({ debug: { uuid: record.record.id, doi: record.record.doi},
    verbose: { record: record }})

  return record
}

const _updateRecord = () => {
  return
}

const _updateRecordAttribute = async (recordId, attribute, data) => {
  Logger.logs({ verbose: { recordId: recordId, attribute: attribute,
    metadata: JSON.stringify(data) } })
    // TODO: Check if attribute is the same as defined in data
  const updatedRecord = await Record.updateRecordAttribute(
    recordId, 
    attribute, 
    data)

  Logger.logs({ verbose: { updatedRecord: JSON.stringify(updatedRecord)}})    
  return updatedRecord
}

const _deleteRecord = async (recordId) => {
  await Record.deleteRecord(recordId)
}

const _publishRecord = async (recordId) => {
  Logger.logs({ verbose: { recordId: recordId } })

  const pr = await Record.publishRecord(recordId);
  return pr;
}

const _getRecordsByOwner = async (ownerId, queryParams) => {
  const query = { owner: ownerId }

  if (queryParams.published === 'true') 
    query.published = true
  else if (queryParams.published === 'false')
    query.published = false

  // if 'published' is not specified, the query will not filter on this field,
  // showing both draft and published records.

  Logger.logs({ debug: { query: query },
    verbose: { query: query, owner: ownerId, queryParams: queryParams } })

  // delegate to the model/DAO methods to perform search
  const records = await Record.records(query)
  return records
}

const records = withAsyncHandler(withLogging(_records, Logger))
const record = withAsyncHandler(withLogging(_record, Logger))
const recordAttribute = withAsyncHandler(withLogging(_recordAttribute, Logger))
const recordByQuery = withAsyncHandler(withLogging(_recordByQuery, Logger))
const createRecord = withAsyncHandler(withLogging(_createRecord, Logger))
const updateRecord = withAsyncHandler(withLogging(_updateRecord, Logger))
const updateRecordAttribute = withAsyncHandler(withLogging(_updateRecordAttribute, Logger))
const deleteRecord = withAsyncHandler(withLogging(_deleteRecord, Logger))
const publishRecord = withAsyncHandler(withLogging(_publishRecord, Logger))
const getRecordsByOwner = withAsyncHandler(withLogging(_getRecordsByOwner, Logger))

module.exports = {
  records,
  record,
  recordAttribute,
  recordByQuery,
  createRecord,
  updateRecord,
  updateRecordAttribute,
  deleteRecord,
  publishRecord,
  getRecordsByOwner
}
