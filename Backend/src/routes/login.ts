import { Router } from "express";
import { prisma } from "../db";
import z from 'zod';
import bcrypt from 'bcrypt';
import { generateAccessToken } from "../utils/jwtFunc";


const loginRouter = Router();

const UserSchema = z.object({
    email : z.string().email(),
    password : z.string().min(6)
});

loginRouter.post('/', async(req, res) => {
    console.log("logging in");
    const { email, password} = req.body;

    try {
        UserSchema.parse({
            email , password
        });
    } catch (e){
        res.status(400).json({Error: e});
        return ;
    }

    const user = await prisma.user.findUnique({
        where: {email}
    }) ;

    if(!user) {
        res.status(404).json({ message: "User Not found"})
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        res.status(401).json({ message: "Incorrect Password"})
        return;
    }

    const accessToken = generateAccessToken(user.id);

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge : 1 * 24 * 60 * 60 * 1000});

    res.status(200).json({ message: 'User logged in successfully' });
})

export default loginRouter;