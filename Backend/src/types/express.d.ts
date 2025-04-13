import { JwtPayload } from "jsonwebtoken";
import * as express from "express";
import { Socket } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // Adjust type based on your payload
    }
  }

}