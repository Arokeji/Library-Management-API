import { type SwaggerOptions } from "swagger-ui-express";

export const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "This is a simple CRUD API",
      license: {
        name: "MIT",
        url: "http://mit.com",
      },
      contact: {
        name: "Hcaleb",
        url: "https://github.com/arokeji",
        email: "hcasanovalebrero@hotmail.com"
      }
    },
    server: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: [
    "./src/models/*/*.ts",
    "./src/routes/*.ts",
  ]
};
