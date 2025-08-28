const authService = require('../services/authService');

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const token = await authService.registerUser({ username, email, password });
  res.status(201).json({ token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const token = await authService.loginUser({ email, password });
  res.status(200).json({ token });
};

module.exports = {
  register,
  login
};