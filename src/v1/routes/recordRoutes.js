// In src/v1/routes/recordRoutes.js
const express = require("express");
const recordController = require("../controllers/recordController");
const { validator, attributePatchValidator } = require("../services/ajvService");
const { paramsValidator, checkAttribute } = require("../../utils/paramsValidator")
const { param } = require('express-validator');

const router = express.Router();

router.get("/", 
  recordController.records);

router.get("/:recordId", 
  recordController.record);

router.get("/:recordId/:attribute", 
  recordController.recordAttribute);

router.post("/", 
  validator, recordController.createRecord);

router.patch("/:recordId", 
  validator, recordController.updateRecord);

router.patch("/:recordId/:attribute", 
  param('attribute')
  .custom(checkAttribute),
  paramsValidator,
  attributePatchValidator, 
  recordController.updateRecordAttribute);

router.delete("/:recordId", 
  recordController.deleteRecord);

module.exports = router;
