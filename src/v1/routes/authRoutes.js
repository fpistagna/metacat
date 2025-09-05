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