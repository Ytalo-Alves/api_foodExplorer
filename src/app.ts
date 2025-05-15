import Fastify from "fastify";
import { routes } from "./routes/index.routes";
import fastifyJwt from "@fastify/jwt";
import { env } from "./env";

export const app = Fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET
})

app.register(routes)