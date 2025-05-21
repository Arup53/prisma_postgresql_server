import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./authMiddleware.js";
import groqTest from "./groqOcr.js";
import { payWithVirtualCard, test, update } from "./cardTranscation.js";
dotenv.config();
const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
const corsOptions = {
    origin: ["http://localhost:3000"],
    credentials: true,
    optionalSuccesssStatus: 200,
};
app.use(express.json());
app.use(cors(corsOptions));
app.get("/", (req, res) => {
    res.send("hello there");
});
app.get("/protected-data", authMiddleware, (req, res) => {
    const user = req.user;
    console.log(user.id);
    res.json({
        message: "Protected data",
        userId: user.id,
        userName: user.name,
    });
});
app.get("/allusers", async (req, res) => {
    const users = await prisma.user.findMany({
        include: {
            transactions: true,
            cardDetails: true,
            invoices: true,
        },
    });
    const result = users.map((user) => {
        var _a, _b, _c, _d;
        const totalAmount = user.transactions.reduce((sum, tx) => {
            return sum + parseFloat(tx.amount.toString());
        }, 0);
        const totalInvoiceExpense = user.invoices.reduce((sum, invoice) => {
            return sum + invoice.total;
        }, 0);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            totalTransactionAmount: totalAmount,
            cardStatus: (_b = (_a = user.cardDetails) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "not applied",
            cardHolderId: (_c = user.cardDetails) === null || _c === void 0 ? void 0 : _c.cardholder_Id,
            cardId: (_d = user.cardDetails) === null || _d === void 0 ? void 0 : _d.card_id,
            invoiceExpense: totalInvoiceExpense,
        };
    });
    res.json(result);
});
app.get("/user/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
            include: {
                transactions: true,
                cardDetails: true,
            },
        });
        res.send(user);
    }
    catch (err) {
        res.status(404).json({ message: "error , no user" });
    }
});
app.get("/users/cardDetails", authMiddleware, async (req, res) => {
    const user = req.user;
    console.log(user.id);
    try {
        const details = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                cardDetails: true,
            },
        });
        res.send(details);
    }
    catch (err) {
        res.status(404).json({ message: "error " });
    }
});
app.get("/groqTest", authMiddleware, async (req, res) => {
    const user = req.user;
    console.log(user.id);
    const queryParam = req.query.img;
    console.log(queryParam);
    if (typeof queryParam !== "string") {
        res.status(400).send("Invalid query parameter. 'img' must be a string.");
        return;
    }
    try {
        const invoiceData = await groqTest(queryParam);
        // const parsedResponse = JSON.parse(response!);
        if (!invoiceData.bill_to ||
            invoiceData.subtotal == null ||
            invoiceData.total == null) {
            res
                .status(422)
                .send("Incomplete or invalid invoice data returned from OCR.");
            return;
        }
        const saveInvoice = await prisma.invoice.create({
            data: {
                billTo: invoiceData.bill_to,
                subtotal: invoiceData.subtotal,
                total: invoiceData.total,
                userId: user.id,
            },
            select: {
                billTo: true,
                subtotal: true,
                total: true,
            },
        });
        res.json(saveInvoice);
    }
    catch (error) {
        console.error("Error parsing response:", error);
        res.status(500).send("Error parsing the response into JSON");
    }
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
    }
    catch (error) {
        console.error("User creation/update error:", error);
        res.status(500).json({ error: "Failed to create/update user" });
    }
});
app.post("/users", authMiddleware, async (req, res) => {
    const user = req.user;
    console.log(user.id);
    const { name, email } = req.body;
    try {
        // const user = await prisma.user.create({
        //   data: { name, email },
        //   select: {
        //     id: true,
        //   },
        // });
        const cardObj = await test(name, email);
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
    }
    catch (err) {
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
app.post("/transaction", authMiddleware, async (req, res) => {
    const user = req.user;
    console.log(user.id);
    const { cardId, amount } = req.body;
    const userId = user.id;
    const result = await payWithVirtualCard(cardId, amount * 100);
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
        }
        catch (err) {
            return res.status(500).json({ message: "Database error" });
        }
    }
    return res.status(402).json({ message: "Transaction declined" });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
