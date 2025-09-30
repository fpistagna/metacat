/**
 * @fileoverview recordController.js file for the MetaCat <Metadata Catalog> API.
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


// In src/controllers/recordController.js

const recordService = require("../services/recordService"),
  className = "recordController",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)
const { withAsyncHandler } = require('../../utils/asyncHandler')
const { withLogging } = require('../../utils/loggerWrapper')

const _records = async (req, res, next) => {
  Logger.logs({ verbose: { query: JSON.stringify(req.query), user: req.user } })
  try {
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
      sort: { 'timestamps.createdAt': -1 },
      select: 'published record.doi owner', // owner metadata',
      populate: [
      //     { path: 'metadata', select: 'attributes.titles' },
          { path: 'owner', select: 'email username -_id' }
      ]
    }
    
    Logger.logs({ verbose: { options: JSON.stringify(options) } })
    
    const allRecords = await recordService.records(req.query, req.user, options)
    
    Logger.logs({ debug: { hits: allRecords.totalDocs },
      verbose: { records: JSON.stringify(allRecords) } })
    
      if (!allRecords.docs.length) res.respondNoContent()
    else 
      res.respond({ data: allRecords, hits: allRecords.totalDocs })
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _record = async (req, res, next) => {
  try {
    const record = await recordService.record(req.params.recordId, req.user)

    Logger.logs({ debug: { uuid: record.record.id }, 
      verbose: { record: record } })

    if (!record)
      res.respond({ id: req.params.recordId }, 404)
    else 
      res.respond({ id: req.params.recordId, data: record }, 200)
  } catch (error) { 
      Logger.error({ error: error })
      return next(error) 
    }
}

const _recordAttribute = async (req, res, next) => {
  try {
    let rId = req.params.recordId
    let rAttribute = req.params.attribute

    const result = await recordService.recordAttribute(rId, rAttribute)

    Logger.logs({ verbose: { record: result.record } })

    if (!result.record)
      res.respond({ recordId: rId }, 404)
    else if (!result.attribute)
      res.respond({ attribute: rAttribute }, 404)
    else {
      Logger.logs({ debug: { recordId: rId, attribute: rAttribute } })

      res.respond({
        recordId: rId,
        attribute: rAttribute,
        values: result.attribute
      }, 200)
    }
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user)

    Logger.logs({ debug: { recordUuid: record.record.id}, 
      verbose: { record: record } })

    res.respondCreated(record)
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _updateRecord = async (req, res) => {
  try {
    const updatedRecord = recordService.updateRecord(req.body)

    if ( updatedRecord.dbOpStatus === "updated" )
      res.status(201).send({ 
        status: "updated", data: updatedRecord.data })
    else if ( updatedRecord.dbOpStatus === "not found" )
      res.status(404).send({
        status: "error", error: updatedRecord.error})
    else
      res.status(500).send({
        status: "error", error: updatedRecord.error})
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _updateRecordAttribute = async (req, res, next) => {
  try {
    let rId = req.params.recordId,
      rAttribute = req.params.attribute,
      reqBody = req.body

    const updatedRecord = await recordService.updateRecordAttribute(
      rId, rAttribute, reqBody)

    Logger.logs({ debug: { updatedRecord: updatedRecord._id },
      verbose: { updatedRecord: JSON.stringify(updatedRecord)}})

    res.respond({
      recordId: rId,
      attribute: rAttribute,
      status: "updated"
    }, 201)
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _deleteRecord = async (req, res, next) => {
  try{
    const { recordId } = req.params
    await recordService.deleteRecord(recordId)
    res.status(204).send()
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const _publishRecord = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const updatedRecord = await recordService.publishRecord(recordId);

    res.respond({
      status: 'success',
      message: 'Record published successfully.',
      data: updatedRecord
    }, 200);
  } catch (error) {
    Logger.error({ error: error })
    return next(error)
  }
}

const records = withAsyncHandler(withLogging(_records, Logger));
const record = withAsyncHandler(withLogging(_record, Logger))
const recordAttribute = withAsyncHandler(withLogging(_recordAttribute, Logger))
const createRecord = withAsyncHandler(withLogging(_createRecord, Logger))
const updateRecord = withAsyncHandler(withLogging(_updateRecord, Logger))
const updateRecordAttribute = withAsyncHandler(withLogging(_updateRecordAttribute, Logger))
const deleteRecord = withAsyncHandler(withLogging(_deleteRecord, Logger))
const publishRecord = withAsyncHandler(withLogging(_publishRecord, Logger))

module.exports = {
  records,
  record,
  recordAttribute,
  createRecord,
  updateRecord,
  updateRecordAttribute,
  deleteRecord,
  publishRecord
}
