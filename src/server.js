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
