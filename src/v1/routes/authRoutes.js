const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { withAsyncHandler } = require('../../utils/asyncHandler');

router.post('/register', withAsyncHandler(authController.register));
router.post('/login', withAsyncHandler(authController.login));

module.exports = router;