/**
 * @fileoverview recordService.js file for the MetaCat <Metadata Catalog> API.
 * @copyright 2025 Fabrizio Pistagna <fabrizio.pistagna@ingv.it> - INGV Sezione Catania - Osservatorio Etneo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


// In src/services/recordService.js
const Record = require("../database/modular/Record")
const className = "recordService",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className),
  customError = require('../../utils/customError')
const { withAsyncHandler } = require('../../utils/asyncHandler')
const { withLogging } = require('../../utils/loggerWrapper')

const _records = async (queryParams, user, options) => {
  Logger.logs({ verbose: { user: user, queryParams: JSON.stringify(queryParams), options: JSON.stringify(options) } })
  // 1. Definiamo la query di base: solo record pubblicati
  const query = { published: true };

  // 2. Se un utente è loggato, modifichiamo la query
  if (user) {
    Logger.logs({ verbose: { userRole: user.role }})
    // Admin e Curator possono vedere tutto (a meno che non filtrino diversamente)
    if (['admin', 'curator'].includes(user.role)) {
      // Admin/Curator: possono filtrare liberamente
      // if (queryParams.published === 'true') query.published = true;
      if (queryParams.published === 'false') query.published = false;
      // Se non c'è un filtro specifico `published` nella querystring, non filtriamo per stato
      // if (queryParams.published === undefined) delete query.published;
    // } else {
    //   // Un 'user' normale vede i record pubblicati O le proprie bozze
    //   query.$or = [
    //     { published: true },
    //     { owner: user.id, published: false }
    //   ];
    //   // delete query.published; // Rimuoviamo la condizione base perché ora è gestita da $or
    }
  } else { query.published = true }

  // Aggiungi qui la logica per la ricerca full-text se presente
  if (queryParams.q) {
    query.$text = { $search: queryParams.q };
  }

  Logger.logs({ verbose: { 
    query: JSON.stringify(query), options: JSON.stringify(options) } })

  const allRecords = await Record.records(query, options); // Passiamo la query al DAO
  Logger.logs({ debug: { hits: allRecords.totalDocs } })
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
