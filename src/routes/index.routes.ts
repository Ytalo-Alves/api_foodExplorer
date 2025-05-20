import { app } from "../app";
import { dishRoutes } from "./dish.routes";
import { orderRoutes } from "./order.routes";
import { userRoutes } from "./user.routes";

export function routes() {
  app.register(userRoutes)
  app.register(dishRoutes)
  app.register(orderRoutes)
}