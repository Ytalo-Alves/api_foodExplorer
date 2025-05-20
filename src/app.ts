import Fastify from "fastify";
import { routes } from "./routes/index.routes";
import fastifyJwt from "@fastify/jwt";
import { env } from "./env";
import fastifyMultipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export const app = Fastify()

app.register(swagger, {
  swagger: {
    info: {
      title: 'Food Explorer API',
      description: 'Documentação da API para o sistema de pedidos em um fast food.',
      version: '1.0.0'
    },
    host: 'localhost:3333',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    }
  }
});

app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET
})

app.register(fastifyMultipart)

app.register(routes)

