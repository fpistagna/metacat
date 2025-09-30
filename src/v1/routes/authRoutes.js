/**
 * @fileoverview authRoutes.js file for the MetaCat <Metadata Catalog> API.
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


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { withAsyncHandler } = require('../../utils/asyncHandler');
const { validator } = require("../services/ajvService");

router.post('/register', validator('auth.register'), withAsyncHandler(authController.register));
router.post('/login', validator('auth.login'), withAsyncHandler(authController.login));
router.get('/orcid', authController.redirectToOrcid);
router.post('/orcid/callback', withAsyncHandler(authController.orcidCallback));

module.exports = router;