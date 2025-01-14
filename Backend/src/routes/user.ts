import { Router } from "express";
import auth from "../middleware/auth";

const userRouter = Router();
userRouter.use(auth);

export default userRouter;
