import { application, Router } from "express";
import { prisma } from "../db";
import bcrypt from 'bcrypt';
import { generateAccessToken} from "../utils/jwtFunc";
import z from 'zod'

const signupRouter = Router();

const UserSchema = z.object({
    email : z.string().email(),
    password : z.string().min(6)
});

signupRouter.post('/', async(req, res) => {
    const {email, password} = req.body;

    try {
        UserSchema.parse({
            email , password
        });
    } catch (e){
        res.status(400).json({Error: e});
        return ;
    }

    const existingUser = await prisma.user.findUnique({
        where: {email}
    });

    if(existingUser) {
            res.status(400).json({message : " User Already Exists, try login or use a different email"});
            return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data : {
            email , password: hashedPassword
        }
    })
    const accessToken = generateAccessToken(user.id);

    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge : 1 * 24 * 60 * 60 * 1000});
    
    res.status(201).json({ message : 'User signed up successfully '});
})

export default signupRouter