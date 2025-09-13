const jwt = require('jsonwebtoken')
const { UserModel } = require('../database/modular/UserSchema')
const customError = require('../../utils/customError')
const className = "Middleware:authentication",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

module.exports.authenticationMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new customError.UserError(33, 
        'No token provided, authorization denied.')

    const token = authHeader.split(' ')[1]
    Logger.logs({ verbose: { token: token } })

    // Verifica il token e ottieni il payload (che contiene user.id)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    Logger.logs({ debug: {  decodedUser: JSON.stringify(decoded.user), 
      id: JSON.stringify(decoded.user.id) } })
    // RECUPERA L'UTENTE COMPLETO DAL DATABASE
    // Questo garantisce che l'utente esista e 
    // che i suoi dati (es. ruolo) siano aggiornati.
    const user = await UserModel.findById(decoded.user.id)
    Logger.logs({ verbose: { user: JSON.stringify(user) }})

    if (!user)
      throw new customError.UserError(35, 
        `User (${decoded.user.id}) identified by provided token no longer exists`,)

    req.user = user
    next()
  } catch (err) {
    // Se l'errore è già uno dei nostri, lo passiamo avanti.
    // Altrimenti, ne creiamo uno nuovo per errori di verifica JWT (es. token scaduto).
    if (err instanceof customError.UserError) {
      return next(err)
    } else {
      const authHeader = req.header('Authorization')
      const token = authHeader.split(' ')[1]
      return next(new customError.UserError(34, 
        `Provided token ${token} is not valid or has expired.`))
    }
  }
}

module.exports.optionalAuthentication = async (req, res, next) => {
  Logger.logs({ verbose: { authHeader: req.header('Authorization') } })
  const authHeader = req.header('Authorization')

  // Se non c'è header o non è Bearer, andiamo avanti senza utente
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    Logger.logs({ verbose: { authHeader: authHeader }})
    return next()
  }

  const token = authHeader.split(' ')[1]
  Logger.logs({ verbose: { token: token }})

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    Logger.logs({ verbose: { decoded: JSON.stringify(decoded) } })
    const user = await UserModel.findById(decoded.user.id)

    // Se troviamo l'utente, lo attacchiamo alla richiesta
    Logger.logs({ verbose: { user: user }})
    if (user) {
      req.user = user
    }
  } catch (err) {
      Logger.error( { error: err })
    // Se il token è presente ma non valido, ignoriamo l'errore e procediamo
    // come se l'utente non fosse loggato.
  }

  next()
}
