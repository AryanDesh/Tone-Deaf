import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import path from 'path';
import { verifyJwt, signJwt,decodeJwt } from "../utils/jwtFunc";

const auth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if(!token) {
        res.status(403).json({
            msg : "jwt not found"
        })
        return;
    }
    const verify = verifyJwt(token);
    if(verify) next();
    else res.status(403).json({msg : "Invalid Token"});
    return;   
}

export default auth;