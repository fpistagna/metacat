const express = require('express'),
  bodyParser = require('body-parser'),
  logger = require('morgan')

const v1Router = require("./v1/routes")
const v1RecordRouter = require("./v1/routes/recordRoutes")
const errorHandler = require("./utils/errorHandler")

const app = express()
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(logger('dev'))

app.use("/api/v1", v1Router)
app.use("/api/v1/records", v1RecordRouter)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`)
})
