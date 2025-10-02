/**
 * @fileoverview server.js file for the MetaCat <Metadata Catalog> API.
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


require('dotenv').config();

const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  winston = require('./utils/logger'),
  responseHelper = require('express-response-helper'),
  swaggerHelper = require('../swagger/swagger')

const v1RecordRouter = require("./v1/routes/recordRoutes")
const v1AuthRouter = require("./v1/routes/authRoutes")
const v1UserRouter = require("./v1/routes/userRoutes")

const errorHandler = require("./utils/errorHandler")

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev', { stream: {
  write: (message) => winston.http(message)
}}))

app.use(responseHelper.helper())

app.use("/api/v1/records", v1RecordRouter)
app.use("/api/v1", v1UserRouter)
app.use("/api-docs",
  swaggerHelper.swaggerUi.serve,
  swaggerHelper.swaggerUi.setup(swaggerHelper.specs)
)
app.use("/api/v1/auth", v1AuthRouter)

app.use(errorHandler)

module.exports = app

if (require.main === module) {
  const PORT = process.env.PORT || 3000
  const { connectDB } = require('./v1/database/modular/mongoose')
  
  const startServer = async () => {
    try {
      await connectDB()
      app.listen(PORT, () => {
        winston.info(`Express server listening on port ${PORT}`)
        winston.debug(`Process env ${process.env.NODE_ENV}`)
      })
    } catch (error) {
      winston.error("Fatal error during server startup:", error);
      process.exit(1);
    }
  }

  startServer()
}
