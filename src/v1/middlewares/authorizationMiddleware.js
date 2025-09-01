const customError = require('../../utils/customError');
const { RecordModel } = require('../database/modular/RecordSchema');
const className = "Middleware:authorization",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

// Middleware per controllare se l'utente ha uno dei ruoli richiesti
const checkRole = (roles) => (req, res, next) => {
  Logger.logs({ debug: { roles: roles, userRole: req.user.role }})
  if (!roles.includes(req.user.role)) {
    throw new customError.UserError(39, 'Forbidden: You do not have the required role.',
      { email: '' }
    );
  }
  next();
};

// Middleware per controllare se l'utente è proprietario del record O ha un ruolo superiore
const checkOwnershipOrRole = (roles) => async (req, res, next) => {
  const record = await RecordModel.getRecordWithId(req.params.recordId);
  if (!record)
    throw new customError.RecordError(6, 'Record not found.');

  const isOwner = record.owner.toString() === req.user.id;
  const hasRole = roles.includes(req.user.role);

  // Un utente normale può modificare/cancellare solo le sue bozze
  if (isOwner && record.published && req.user.role === 'user')
    throw new customError.RecordError(13, 'Forbidden: Cannot modify a published record.',
      { recordId: req.params.recordId });

  if (isOwner || hasRole) {
    // Per passare il record al controller senza una seconda query, lo attacchiamo a 'req'
    req.record = record;
    return next();
  }

  throw new customError.UserError(12, 'Forbidden: You are not the owner of this resource nor have the required role.');
};

module.exports = {
  checkRole,
  checkOwnershipOrRole
};