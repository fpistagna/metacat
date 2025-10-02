/**
 * @fileoverview swagger.js file for the MetaCat <Metadata Catalog> API.
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


const swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "MetaCat Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application for DataCite metadata, with JWT authentication.",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Fabrizio Pistagna",
        url: "https://github.com/fpistagna/metacat",
        email: "fabrizio.pistagna@ingv.it",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local development server"
      },
      {
        url: "https://localhost",
        description: "Local development server (via Nginx proxy)"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./swagger/routes/*.yaml", "./swagger/components/*.yaml"],
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};