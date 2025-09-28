// In src/controllers/userController.js

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