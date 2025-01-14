import { Request, Response, NextFunction } from "express"
import { verifyJwt} from "../utils/jwtFunc";

const auth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    if(!token) {
        res.status(403).json({
            msg : "jwt not found"
        })
        return;
    }
    try{
        const decoded = verifyJwt(token);
        req.user = decoded;
        next();
    }catch(e){
        res.status(403).json({msg : "Invalid Token"});
    }
    return;   
}

export default auth;