/**
 * @fileoverview 2025.09.08T17.56.17.add-notes-to-users.js file for the MetaCat <Metadata Catalog> API.
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


'use strict';

/** @type {import('umzug').MigrationFn<any>} */
module.exports.up = async ({ context: connection }) => {
  // Connection is passed by umzug from the migration context
  const usersCollection = connection.collection('users');
  // Ad 'notes' field to users collection. It is a string, defaulting to empty string.
  await usersCollection.updateMany(
    { notes: { $exists: false } }, // Condition: apply only to documents where 'notes' does not exist
    { $set: { notes: '' } }        // Action: set 'notes' field to empty string
  );
};

/** @type {import('umzug').MigrationFn<any>} */
module.exports.down = async ({ context: connection }) => {
  const usersCollection = connection.collection('users');

  await usersCollection.updateMany(
    {}, // Condition: apply to all documents
    { $unset: { notes: 1 } } // Action: remove 'notes' field
  );
};