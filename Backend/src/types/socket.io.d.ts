import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket {
    userId?: string;  // Add the userId property to the Socket interface
  }
}
