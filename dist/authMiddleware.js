// authMiddleware.js
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const prisma = new PrismaClient();
dotenv.config();
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
        res.status(401).json({ error: "Unauthorized" });
        return; // Just return, don't return the response
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ error: "Invalid token" });
        return; // Just return, don't return the response
    }
};
