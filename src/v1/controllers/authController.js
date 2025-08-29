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

const redirectToOrcid = (req, res) => {
  const authorizationUrl = new URL('https://sandbox.orcid.org/oauth/authorize');

  authorizationUrl.searchParams.append('client_id', process.env.ORCID_CLIENT_ID);
  authorizationUrl.searchParams.append('response_type', 'code');
  authorizationUrl.searchParams.append('scope', '/authenticate');
  authorizationUrl.searchParams.append('redirect_uri', process.env.ORCID_REDIRECT_URI);

  res.redirect(authorizationUrl.toString());
};

const orcidCallback = async (req, res) => {
  const { code } = req.body; // Il client invia il codice nel body
  if (!code) {
    throw new customError.UserError(34, 'Authorization code is missing.');
  }
  const token = await authService.handleOrcidCallback(code);
  res.status(200).json({ token });
};

module.exports = {
  register,
  login,
  redirectToOrcid,
  orcidCallback
};