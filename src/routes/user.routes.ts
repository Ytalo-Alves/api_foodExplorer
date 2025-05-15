import { app } from "../app";
import { SessionController } from "../controller/auth/session-controller";
import { UserController } from "../controller/user/user-controller";

const userController = new UserController()
const sessionController = new SessionController()

export function userRoutes() {
  app.post('/users', userController.create)
  app.post('/session', sessionController.create)
}