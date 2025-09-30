/**
 * @fileoverview authorizationMiddleware.js file for the MetaCat <Metadata Catalog> API.
 * @copyright 2025 Fabrizio Pistagna <fabrizio.pistagna@ingv.it> - INGV Sezione Catania - Osservatorio Etneo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


const customError = require('../../utils/customError');
const { RecordModel } = require('../database/modular/RecordSchema');
const className = "Middleware:authorization",
  LoggerHelper = require('../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)

// Middleware per controllare se l'utente ha uno dei ruoli richiesti
const checkRole = (roles) => (req, res, next) => {
  Logger.logs({ debug: { roles: roles, userRole: req.user.role }})
  if (!roles.includes(req.user.role)) {
    throw new customError.UserError(39, 
      `Forbidden: Operation not allowed by user role (${req.user.role}).`,
      { role: req.user.role }
    );
  }
  next();
};

// Middleware per controllare se l'utente è proprietario del record O ha un ruolo superiore
const checkOwnershipOrRole = (roles) => async (req, res, next) => {
  const record = await RecordModel.recordWithId(req.params.recordId);
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