import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("hello there");
});

// const res = await getUser("koi");

// console.log(res);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
