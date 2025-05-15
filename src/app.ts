import Fastify from "fastify";
import { routes } from "./routes/index.routes";
import fastifyJwt from "@fastify/jwt";
import { env } from "./env";
import fastifyMultipart from "@fastify/multipart";

export const app = Fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET
})

app.register(fastifyMultipart)

app.register(routes)