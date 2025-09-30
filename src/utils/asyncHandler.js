/**
 * @fileoverview asyncHandler.js file for the MetaCat <Metadata Catalog> API.
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


const withAsyncHandler = (fn) => {
  // Restituisce una funzione che esegue l'originale dentro un try/catch
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      // Cattura qualsiasi errore e lo rilancia per essere gestito
      // dal controller (con next) o da un altro wrapper.
      throw error;
    }
  };
};

module.exports = { withAsyncHandler };