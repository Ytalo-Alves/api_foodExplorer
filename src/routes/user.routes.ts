import { app } from "../app";
import { UserController } from "../controller/user-controller";

const userController = new UserController()

export function userRoutes() {
  app.post('/users', userController.create)
}