// authMiddleware.js
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const prisma = new PrismaClient();

dotenv.config();

// export const authMiddleware = async (req: any, res: any, next: any) => {
//   // Get the token from the Authorization header
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const userId = authHeader.split(" ")[1];

//   try {
//     // Find the user in your database
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       return res.status(401).json({ error: "User not found" });
//     }

//     // Attach the user to the request object
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("Authentication error:", error);
//     res.status(500).json({ error: "Authentication failed" });
//   }
// };

// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;
//   console.log(authHeader);
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized - No token" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     // Verify token (this will decode the user ID we stored in token.id)
//     const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET!);

//     if (!decoded.id) {
//       return res.status(401).json({ error: "Invalid token payload" });
//     }

//     // Example DB lookup (optional)
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.id },
//     });

//     if (!user) {
//       return res.status(401).json({ error: "User not found" });
//     }
//     // @ts-ignore
//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("Auth error:", err);
//     res.status(401).json({ error: "Token invalid or expired" });
//   }
// };

export const authMiddleware = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    req.user = decoded; // { id, email }
    // console.log(req.user);
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};
