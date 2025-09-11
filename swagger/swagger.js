const swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "ARF Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application for DataCite metadata, with JWT authentication.",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Fabrizio Pistagna",
        url: "https://github.com/fpistagna/arf",
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