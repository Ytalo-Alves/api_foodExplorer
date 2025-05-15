import { app } from "../app";
import { userRoutes } from "./user.routes";

export function routes() {
  app.register(userRoutes)
}