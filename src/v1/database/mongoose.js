'use strict';

const mongoose = require('mongoose');

const RecordSchema = require('./RecordSchema');
const RecordModel = mongoose.model("Record", RecordSchema.RecordSchema);

//module.exports.connectDB = function () {
function connectDB() {
  const url = "mongodb://127.0.0.1:27017/test";
 
  try {
    mongoose.connect(url);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    console.log(`Database connected: ${url}`);
  });
 
  dbConnection.on("error", (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
}

module.exports = {
  RecordModel,
  connectDB
}