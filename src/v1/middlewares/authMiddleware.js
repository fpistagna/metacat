const jwt = require('jsonwebtoken');
const customError = require('../../utils/customError');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new customError.UserError(33, 'No token, authorization denied.', { email: '' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
      throw new customError.UserError(34, 'Token is not valid.', { email: '' });
  }
};

module.exports = authMiddleware;