import { app } from "../app";
import { OrderController } from "../controller/order/order-controller";
import { VerifyJwt } from "../middlewares/verify-jwt";
import { VerifyUserIsAdmin } from "../middlewares/verify-user-is-admin";

export function orderRoutes() {
  const orderController = new OrderController()

  app.post('/order', {onRequest: [VerifyJwt]}, orderController.create)
  app.get('/order', {onRequest: [VerifyJwt]}, orderController.index)
  app.patch('/order/:id', {onRequest: [VerifyJwt, VerifyUserIsAdmin]}, orderController.update)
}