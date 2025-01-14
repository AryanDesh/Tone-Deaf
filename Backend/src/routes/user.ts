import { Router } from "express";
import auth from "../middleware/auth";
import { prisma } from "../db";
const userRouter = Router();
userRouter.use(auth);

userRouter.get('/profile', async(req, res) =>{
    const userId = req.userId;

    const user = await prisma.user.findUnique({
        where: {
            id : userId
        }
    })
    res.status(200).json(user);
})

userRouter.get('/logout', (req, res) =>{
    try {
        res.clearCookie('accessToken', { httpOnly: true });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong during logout", error });
    }
})

export default userRouter;
