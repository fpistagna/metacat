const jwt = require('jsonwebtoken');
const { UserModel } = require('../database/modular/UserSchema');
const customError = require('../../utils/customError');
const className = "Middleware:auth",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new customError.UserError(33, 'No token, authorization denied.', { email: '' });
    }

    const token = authHeader.split(' ')[1];
    Logger.logs({ verbose: { token: token } })

    // Verifica il token e ottieni il payload (che contiene user.id)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    Logger.logs({ debug: { decodedUser: JSON.stringify(decoded.user), id: JSON.stringify(decoded.user.id) } });
    // RECUPERA L'UTENTE COMPLETO DAL DATABASE
    // Questo garantisce che l'utente esista ancora e che i suoi dati (es. ruolo) siano aggiornati.
    const user = await UserModel.findById(decoded.user.id);
    Logger.logs({ verbose: { user: JSON.stringify(user) }});

    if (!user)
      throw new customError.UserError(35, 'User belonging to this token no longer exists.');

    req.user = user;
    next();
    // try {
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   Logger.logs({ debug: { decodedUser: JSON.stringify(decoded.user) } })
    //   req.user = decoded.user;
    //   next();
    // } catch (err) {
    //     throw new customError.UserError(34, 'Token is not valid.', { email: '' });
    // }
  } catch (err) {
    // Se l'errore è già uno dei nostri, lo passiamo avanti.
    // Altrimenti, ne creiamo uno nuovo per errori di verifica JWT (es. token scaduto).
    if (err instanceof customError.UserError) {
      return next(err);
    }
    return next(new customError.UserError(34, 'Token is not valid or has expired.', { email: ''}));
  }
};

module.exports = authMiddleware;