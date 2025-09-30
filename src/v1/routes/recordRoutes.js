/**
 * @fileoverview recordRoutes.js file for the MetaCat <Metadata Catalog> API.
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


// In src/v1/routes/recordRoutes.js
const express = require("express");
const recordController = require("../controllers/recordController");
const { validator, attributePatchValidator } = require("../services/ajvService");
const { paramsValidator, checkAttribute } = require("../../utils/paramsValidator");
const { param } = require('express-validator');
const { authenticationMiddleware, optionalAuthentication } = require('../middlewares/authenticationMiddleware');
const { checkRole, checkOwnershipOrRole } = require('../middlewares/authorizationMiddleware');

const router = express.Router();

router.get("/", 
  optionalAuthentication,
  recordController.records);

router.get("/:recordId", 
  optionalAuthentication,
  recordController.record);

router.get("/:recordId/:attribute", 
  recordController.recordAttribute);

router.post("/", 
  authenticationMiddleware, validator('root'), recordController.createRecord);

router.patch("/:recordId", 
  authenticationMiddleware, 
  checkOwnershipOrRole(['admin', 'curator']),
  validator('patchRootSchema'), recordController.updateRecord);

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
