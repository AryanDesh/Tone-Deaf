import { Router } from "express";
import { prisma } from "../db";
import bcrypt from 'bcrypt';
import { generateAccessToken} from "../utils/jwtFunc";
import z from 'zod'
const signupRouter = Router();

const UserSchema = z.object({
    username: z.string(),
    email : z.string().email(),
    password : z.string().min(6)
});

signupRouter.post('/', async(req, res) => {
    console.log("Signing UP");
    const {username, email, password} = req.body;

    try {
        UserSchema.parse({
            username, email , password
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
            username, email , password: hashedPassword
        }
    })
    const likedPlaylist = await prisma.playlist.create({
        data : {
            name : "liked",
            userId : user.id

        }
    })
    prisma.user.update({
        where: { id: user.id },
            data: { likedId: likedPlaylist.id },
    })
    
    const accessToken = generateAccessToken(user.id);
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge : 1 * 24 * 60 * 60 * 1000});
    
    res.status(200).json({ message : 'User signed up successfully '});
})

export default signupRouter