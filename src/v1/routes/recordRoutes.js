// In src/v1/routes/recordRoutes.js
const express = require("express");
const recordController = require("../controllers/recordController");
const { validator, patchValidator } = require("../services/ajvService");
const { paramsValidator, checkAttribute } = require("../../utils/paramsValidator")
const { param } = require('express-validator');

const router = express.Router();

router.get("/", 
  recordController.getAllRecords);

router.get("/:recordId", 
  recordController.getOneRecord);

router.get("/:recordId/:attribute", 
  recordController.getRecordAttribute);

router.post("/", 
  validator, recordController.createNewRecord);

router.patch("/:recordId", 
  validator, recordController.updateOneRecord);

router.patch("/:recordId/:attribute", 
  param('attribute')
  .custom(checkAttribute),
  paramsValidator,
  patchValidator, 
  recordController.updateOneRecordAttribute);

router.delete("/:recordId", 
  recordController.deleteOneRecord);

module.exports = router;
