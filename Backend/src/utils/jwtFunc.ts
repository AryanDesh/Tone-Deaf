import jwt from 'jsonwebtoken';
import { z } from 'zod';

const jwtPassword = process.env.JWT_SECRET || 'secret';
const UserSchema = z.object({
    username : z.string().email(),
    password : z.string().min(6)
});
type InferSchema = z.infer<typeof UserSchema>;

const signJwt = (username: string, password: string) => {
    try {
        UserSchema.parse({
            username , password
        });
    } catch {
        return null;
    }
    const payload = { username, password };
    return jwt.sign(payload, jwtPassword, { expiresIn: '1h' });
}


const verifyJwt = (token: string) : boolean => {
    try{
        jwt.verify(token, jwtPassword);
        return true;
    }
    catch(e){
        return false;
    }
}
function decodeJwt(token: string) {
    try {
        return jwt.decode(token) || false;
    } catch {
        return false;
    }
}
export {
    signJwt,
    verifyJwt,
    decodeJwt,
    jwtPassword,
  }