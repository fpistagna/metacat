const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  winston = require('./utils/logger'),
  responseHelper = require('express-response-helper'),
  swaggerHelper = require('../swagger/swagger')

const v1RecordRouter = require("./v1/routes/recordRoutes")
const errorHandler = require("./utils/errorHandler")

const { connectDB } = require('./v1/database/modular/mongoose')
const dbConn = async () => {
  try { await connectDB() } 
  catch (error) {
    //  extra, connectDB should have already exited process
    console.error("Fatal error during server startup:", error);
    process.exit(1);
  }
}
dbConn()

const app = express()
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev', { stream: {
  write: (message) => winston.http(message)
}}))

app.use(responseHelper.helper())

app.use("/api/v1/records", v1RecordRouter)
app.use(errorHandler)

app.use("/api-docs",
  swaggerHelper.swaggerUi.serve,
  swaggerHelper.swaggerUi.setup(swaggerHelper.specs)
)

app.listen(PORT, () => {
  winston.info(`Express server listening on port ${PORT}`)
  winston.debug(`Process env ${process.env.NODE_ENV}`)
})
