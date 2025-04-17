import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { payWithVirtualCard, test, update } from "./cardTranscation.js";
import { authMiddleware } from "./authMiddleware.js";

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
// @ts-ignore
app.get("/protected-data", authMiddleware, (req, res) => {
  // req.user now contains the authenticated user data
  // @ts-ignore
  console.log(req.user.id);
  res.json({
    message: "Protected data",
    // @ts-ignore
    userId: req.user.id,
    // @ts-ignore
    userName: req.user.name,
  });
});

app.post("/auth/user", async (req, res) => {
  const { name, email } = req.body;

  try {
    // Check if user exists
    let newUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!newUser) {
      // Create new user
      newUser = await prisma.user.create({
        data: {
          name,
          email,
        },
      });
    }

    res.json({ id: newUser.id, name: newUser.name });
  } catch (error) {
    console.error("User creation/update error:", error);
    res.status(500).json({ error: "Failed to create/update user" });
  }
});

app.post("/users", async (req, res) => {
  const { name } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name },
      select: {
        id: true,
      },
    });
    const cardObj = await test();

    const response = await prisma.cardDetails.create({
      data: {
        id: user.id,
        cardholder_Id: cardObj.cardholderId,
        card_id: cardObj.cardId,
      },
      select: {
        cardholder_Id: true,
        card_id: true,
      },
    });

    res.json({
      message: "success",
      cardHolderId: response.cardholder_Id,
      cardId: response.card_id,
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.put("/admin/approve", async (req, res) => {
  const { cardHolderId, cardId } = req.body;

  const result = await update(cardHolderId, cardId);

  const response = await prisma.cardDetails.update({
    where: { card_id: cardId },
    data: { status: true },
  });

  res.json({
    message: "success",
  });
});

app.post("/transaction", async (req: any, res: any) => {
  const { userId, cardId, amount } = req.body;

  const result = await payWithVirtualCard(cardId, amount);

  if (result.approved) {
    try {
      const created = await prisma.transaction.create({
        data: { userId, amount },
        select: { amount: true },
      });

      return res.json({
        message: "success",
        amount: created.amount,
      });
    } catch (err) {
      return res.status(500).json({ message: "Database error" });
    }
  }

  return res.status(402).json({ message: "Transaction declined" });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
