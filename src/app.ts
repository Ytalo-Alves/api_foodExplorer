import Fastify from "fastify";
import { routes } from "./routes/index.routes";

export const app = Fastify()

app.register(routes)