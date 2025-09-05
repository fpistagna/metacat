const className = "Handler:error",
  LoggerHelper = require('./loggerHelper'),
  Logger = new LoggerHelper.Logger(className);

// MAPPA DEGLI ERRORI
// Associa errori personalizzati a stati HTTP e messaggi.
const ERROR_MAP = {
  RecordCreationError: {
    1: { status: 400, message: 'Invalid data for record creation.' },
    2: { status: 400, message: 'A similar record might already exist.' },
    default: { status: 500, message: 'An unexpected error occurred during record creation.' }
  },
  RecordError: {
    6: { status: 404, message: 'Record not found.' },
    7: { status: 404, message: (err) => `No Record found with id ${err.recordId}.` },
    8: { status: 404, message: (err) => `The provided ID '${err.recordId}' has an invalid format.` },
    9: { status: 404, message: (err) => `No Records matching query '${err.query}'` },
    106: { status: 400, message: (err) => `Record with id ${err.recordId} is already published.` },
    107: { status: 401, message: 'Forbidden: Cannot modify a published record.' },
    108: { status: 500, message: (err) => `Error while deleting Record ID ${err.recordId}`},
    109: {status: 500, message: (err) => `Error saving Record id ${err.recordId} while publishing it.`},
    default: { status: 500, message: 'An unexpected record error occurred.' }
  },
  MetadataError: {
    10: { status: 409, message: (err) => `Metadata Record Id ${err.recordMetadataId} already exists.` },
    11: { status: 403, message: 'Invalid metadata provided.' },
    12: { status: 422, message: (err) => `Attribute '${err.attr}' is not included in the allowed attributes (${err.attrs}).` },
    13: { status: 422, message: 'Unprocessable entity during patch operation.' },
    14: { status: 500, message: (err) => `Error while deleting RecordMetadata ID ${err.recordMetadataId}.`},
    default: { status: 500, message: 'An unexpected metadata error occurred.' }
  },
  MongooseError: {
    20: { status: 500, message: `Error connecting to database.` },
    default: { status: 500, message: 'A database-level error occurred.' }
  },
  UserError: {
    30: { status: 400, message: (err) => `User with email ${err.email} already exists.`},
    31: { status: 403, message: (err) => `Invalid credentials (${err.email}).` },
    32: { status: 403, message: 'Wrong password.' },
    33: { status: 401, message: 'No token, authorization denied.' },
    34: { status: 401, message: 'Token is not valid.' },
    35: { status: 400, message: 'User identified by provided token no longer exists.' },
    36: { status: 400, message: 'Failed to retrieve ORCID iD.' },
    37: { status: 500, message: 'ORCID server error.' },
    38: { status: 500, message: 'Network error during ORCID token exchange.' },
    39: { status: 403, message: (err) => `Forbidden: Your role (${err.role}) does not have the required permission.` },
    40: { status: 403, message: 'Forbidden: You are not the owner of this resource nor have the required role.' },
    default: { status: 500, message: 'A user-level error occurred.' }
  },
  ValidationError: {
    50: { status: 403, message: (err) => `Invalid input provided: '${err.instancePath}' - ${err.message}` },
    default: { status: 500, message: 'A validation-level error occurred.'}
  },
  // Errore di default per tutti gli altri casi non mappati
  default: {
    default: { status: 500, message: 'An unexpected server error occurred.' }
  }
};

const errorHandler = (error, req, res, next) => {
  Logger.callerFunction = `errorHandler:${error.name}`;
  // Logga l'oggetto errore completo
  Logger.error({ 
    error: { 
      name: error.name, 
      code: error.code, 
      message: error.message, 
      stack: error.stack 
    } 
  });

  if (res.headersSent) {
    return next(error);
  }

  // Trova la configurazione per l'errore attuale, o usa il default
  const errorConfig = (ERROR_MAP[error.name] || ERROR_MAP.default);
  const config = errorConfig[error.code] || errorConfig.default;

  // const message = typeof config.message === 'function' 
  //   ? config.message(error) 
  //   : error.message || config.message;

  const message = typeof config.message === 'function'
    ? config.message(error)
    : config.message;

  // Il messaggio DETTAGLIATO originale viene solo loggato, mai inviato.
  const privateMessage = error.message;
  Logger.error({ error: { privateMessage: privateMessage } });

  res.status(config.status).send({
    type: error.name,
    errorCode: error.code,
    message: message
  });
};

module.exports = errorHandler;