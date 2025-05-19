import { app } from "../app";
import { DishController} from "../controller/dish/dish-controller";
import { VerifyJwt } from "../middlewares/verify-jwt";

const dishController = new DishController()

export function dishRoutes() {
  app.post('/dish',{onRequest: [VerifyJwt]}, dishController.create)
  app.get('/dish', {onRequest: [VerifyJwt]}, dishController.show)
  app.delete('/dish/:id', {onRequest: [VerifyJwt]}, dishController.delete)
  app.get('/dishes', {onRequest:[VerifyJwt]}, dishController.index)
  app.patch('/dish/:id', {onRequest: [VerifyJwt]}, dishController.update)
}