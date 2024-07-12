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
