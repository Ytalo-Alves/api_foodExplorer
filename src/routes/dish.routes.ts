import { app } from "../app";
import { DishController } from "../controller/dish/dish-controller";
import { VerifyJwt } from "../middlewares/verify-jwt";

const dishController = new DishController()

export function dishRoutes() {
  app.addHook("onRequest", VerifyJwt)
  app.post('/dish', dishController.create)
}