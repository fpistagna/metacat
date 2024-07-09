const swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "ARF Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application - lovely ♥️ defined Simplistic - made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "FPista",
        url: "https://github.com/fpistagna",
        email: "fabrizio.pistagna@ingv.it",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },
  apis: ["./swagger/routes/*.yaml"],
}

const specs = swaggerJsdoc(options)

module.exports = {
  specs,
  swaggerUi
}
