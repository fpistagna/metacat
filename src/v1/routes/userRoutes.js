// In src/v1/routes/userRoutes.js
'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticationMiddleware } = require('../middlewares/authenticationMiddleware');
const { withAsyncHandler } = require('../../utils/asyncHandler');

const meRouter = express.Router();

meRouter.get('/records', withAsyncHandler(userController.getMyRecords));

router.use('/me', authenticationMiddleware, meRouter);

module.exports = router;