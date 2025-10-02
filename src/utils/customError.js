/**
 * @fileoverview customError.js file for the MetaCat <Metadata Catalog> API.
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


class MCError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;

    // Aggiunge eventuali proprietà extra passate nelle opzioni
    Object.assign(this, options);
  }
}

class MetadataError extends MCError { }
class RecordError extends MCError { }
class RecordCreationError extends MCError { }
class MongooseError extends MCError { }
class UserError extends MCError { }
class ValidationError extends MCError { }

module.exports = { 
  MetadataError,
  RecordError,
  RecordCreationError,
  MongooseError,
  UserError,
  ValidationError
}