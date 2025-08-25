'use strict';

const mongoose = require('mongoose');
const winston = require('../../../utils/logger');
const className = "Mongoose:RecordModel",
  LoggerHelper = require('../../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className);
 
function connectDB() {
  Logger.callerFunction = 'connectDB';
  const url = "mongodb://127.0.0.1:27017/arf0825";
 
  try {
    mongoose.connect(url); } 
  catch (err) {
    Logger.error({ error: err });
    throw new customError.MongooseError(20,
          `Error connecting to DB... :_(`);
    process.exit(1); 
  }

  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    Logger.logs({ debug: { dbURL: url } })
  });
 
  dbConnection.on("error", (err) => {
    Logger.error({ error: err })
  });
  
  return;
}

module.exports = {
  connectDB
}