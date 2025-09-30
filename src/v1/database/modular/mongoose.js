/**
 * @fileoverview mongoose.js file for the MetaCat <Metadata Catalog> API.
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