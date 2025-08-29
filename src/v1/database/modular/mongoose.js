'use strict'

const mongoose = require('mongoose')
const className = "Mongoose:RecordModel",
  LoggerHelper = require('../../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)
 
async function connectDB() {
  Logger.callerFunction = 'connectDB'
  const url = process.env.DATABASE_URL 
  
  try {
    await mongoose.connect(url) 
    Logger.logs({ debug: { message: `Successfully connected to database.` } }) } 
  catch (err) {
    Logger.error({ error: err })
    process.exit(1)
  }

  const dbConnection = mongoose.connection

  dbConnection.once("open", (_) => {
    Logger.logs({ debug: { dbURL: url, message: "Connection is open." } })
  })
 
  dbConnection.on("error", (err) => {
    Logger.error({ error: `MongoDB runtime error: ${err}` }) })
  
  // return
}

async function disconnectDB() {
  await mongoose.disconnect;
}

module.exports = {
  connectDB,
  disconnectDB
}