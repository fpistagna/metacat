// In src/v1/routes/recordRoutes.js
const express = require("express");
const recordController = require("../controllers/recordController");
const { validator, attributePatchValidator } = require("../services/ajvService");
const { paramsValidator, checkAttribute } = require("../../utils/paramsValidator");
const { param } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get("/", 
  recordController.records);

router.get("/:recordId", 
  recordController.record);

router.get("/:recordId/:attribute", 
  recordController.recordAttribute);

router.post("/", 
  authMiddleware, validator, recordController.createRecord);

router.patch("/:recordId", 
  authMiddleware, validator, recordController.updateRecord);

router.patch("/:recordId/:attribute", 
  param('attribute')
  .custom(checkAttribute),
  authMiddleware,
  paramsValidator,
  attributePatchValidator, 
  recordController.updateRecordAttribute);

router.delete("/:recordId", 
  authMiddleware,
  recordController.deleteRecord);

module.exports = router;
