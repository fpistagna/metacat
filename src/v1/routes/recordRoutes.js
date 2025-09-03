// In src/v1/routes/recordRoutes.js
const express = require("express");
const recordController = require("../controllers/recordController");
const { validator, attributePatchValidator } = require("../services/ajvService");
const { paramsValidator, checkAttribute } = require("../../utils/paramsValidator");
const { param } = require('express-validator');
const authenticationMiddleware = require('../middlewares/authenticationMiddleware');
const { checkRole, checkOwnershipOrRole } = require('../middlewares/authorizationMiddleware');

const router = express.Router();

router.get("/", 
  recordController.records);

router.get("/:recordId", 
  recordController.record);

router.get("/:recordId/:attribute", 
  recordController.recordAttribute);

router.post("/", 
  authenticationMiddleware, validator, recordController.createRecord);

router.patch("/:recordId", 
  authenticationMiddleware, 
  checkOwnershipOrRole(['admin', 'curator']),
  validator, recordController.updateRecord);

router.patch("/:recordId/:attribute", 
  param('attribute')
  .custom(checkAttribute),
  authenticationMiddleware,
  paramsValidator,
  attributePatchValidator, 
  recordController.updateRecordAttribute);

router.delete("/:recordId", 
  authenticationMiddleware, checkRole(['admin']),
  recordController.deleteRecord);

// Rotta per pubblicare un record (solo per admin e curator)
router.post(
  "/:recordId/publish",
  authenticationMiddleware,
  checkRole(['admin', 'curator']),
  recordController.publishRecord
);

module.exports = router;
