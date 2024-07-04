'use strict';

const mongoose = require('mongoose');
const winston = require('../../../utils/logger');

function connectDB() {
  const url = "mongodb://127.0.0.1:27017/test";
 
  try {
    mongoose.connect(url); } 
  catch (err) {
    winston.error(err.message);
    process.exit(1); 
  }

  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    winston.debug(`Database connected: ${url}`); 
  });
 
  dbConnection.on("error", (err) => {
    winston.error(`connection error: ${err}`); 
  });
  
  return;
}

module.exports = {
  connectDB
}