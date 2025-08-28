const { UserModel } = require('../database/modular/UserSchema');
const jwt = require('jsonwebtoken');
const customError = require('../../utils/customError');

const signToken = (userId) => {
  const payload = { user: { id: userId } };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const registerUser = async ({ username, email, password }) => {
  let user = await UserModel.findOne({ email });
  if (user) {
    throw new customError.UserError(30, `User with email ${email} already exists.`, { email: email });
  }

  user = new UserModel({ username, email, password });
  await user.save();

  return signToken(user.id);
};

const loginUser = async ({ email, password }) => {
  // +password forza Mongoose a restituire il campo password, che abbiamo nascosto con select: false
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user) {
    throw new customError.UserError(31, 'Invalid credentials.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new customError.RecordError(32, 'Wrong password.');
  }

  return signToken(user.id);
};

module.exports = {
  registerUser,
  loginUser
};