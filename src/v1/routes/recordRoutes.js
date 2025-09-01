// In src/v1/routes/recordRoutes.js
const express = require("express");
const recordController = require("../controllers/recordController");
const { validator, attributePatchValidator } = require("../services/ajvService");
const { paramsValidator, checkAttribute } = require("../../utils/paramsValidator");
const { param } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole, checkOwnershipOrRole } = require('../middlewares/authorizationMiddleware');

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
  authMiddleware, 
  checkOwnershipOrRole(['admin', 'curator']),
  validator, recordController.updateRecord);

router.patch("/:recordId/:attribute", 
  param('attribute')
  .custom(checkAttribute),
  authMiddleware,
  paramsValidator,
  attributePatchValidator, 
  recordController.updateRecordAttribute);

router.delete("/:recordId", 
  authMiddleware, checkOwnershipOrRole(['admin', 'curator']),
  recordController.deleteRecord);

// Rotta per pubblicare un record (solo per admin e curator)
router.post(
  "/:recordId/publish",
  authMiddleware,
  checkRole(['admin', 'curator']),
  recordController.publishRecord
);

module.exports = router;
