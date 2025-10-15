/**
 * @fileoverview userController.js file for the MetaCat <Metadata Catalog> API.
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


'use strict'

const recordService = require('../services/recordService')
const className = "userController"
const LoggerHelper = require('../../utils/loggerHelper')
const Logger = new LoggerHelper.Logger(className)
const { withAsyncHandler } = require('../../utils/asyncHandler')
const { withLogging } = require('../../utils/loggerWrapper')

const _getMyRecords = async (req, res, next) => {
  const userId = req.user.id
  const queryParams = req.query // es. ?published=false

  const records = await recordService.getRecordsByOwner(userId, queryParams)
  Logger.logs({ debug: { hits: records.totalDocs }, 
    verbose: { records: JSON.stringify(records) } })
  
  if (!records.docs.length) 
    return res.respondNoContent()

  res.respond({ data: records, hits: records.totalDocs })
}

module.exports = {
  getMyRecords: withAsyncHandler(withLogging(_getMyRecords, Logger))
}