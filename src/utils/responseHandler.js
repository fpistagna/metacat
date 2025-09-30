/**
 * @fileoverview responseHandler.js file for the MetaCat <Metadata Catalog> API.
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


// responseHandler.js

const responseHandler = (code, data, req, res, next) => {
  console.log(`Response Handler: ${code}\n${data}\n`)

  switch(code) {
    case 200:
      return res.status(200).send({
        status: "success", data: data })    
    case 201:
      return res.status(201).send({ 
        status: "created", data: data })

    case 204:
      return res.status(204).send({ 
        status: "no data",
        data: data
      })

    default:
      return next()
  }
}

module.exports = responseHandler;