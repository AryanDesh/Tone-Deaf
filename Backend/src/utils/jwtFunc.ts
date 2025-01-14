import jwt from 'jsonwebtoken';
import { z } from 'zod';

const jwtPassword = process.env.JWT_SECRET || 'secret';
const refreshPassword = process.env.REFRESH_PASS || "refresh";

const UserSchema = z.object({
    username : z.string().email(),
    password : z.string().min(6)
});
type InferSchema = z.infer<typeof UserSchema>;

export const generateAccessToken = (id : string) => {
    return jwt.sign({id : id}, jwtPassword!, { expiresIn: '1d' });
}

export const verifyJwt = (token: string)  => {
    const decoded = jwt.verify(token, jwtPassword);
        return decoded;
}
function decodeJwt(token: string) {
    try {
        return jwt.decode(token) || false;
    } catch {
        return false;
    }
}
