/**
 * @fileoverview server.test.js file for the MetaCat <Metadata Catalog> API.
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


const express = require('express'),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  responseHelper = require('express-response-helper')

const v1RecordRouter = require("../src/v1/routes/recordRoutes")
const errorHandler = require("../src/utils/errorHandler")
const responseHandler = require("../src/utils/responseHandler")

const app = express()
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(logger('dev'))

app.use(responseHelper.helper())

app.use("/api/v1/records", v1RecordRouter)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`)
})

module.exports = app; // for testing
