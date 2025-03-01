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
  res.send("Ulla ulla jinga laga");
});

// let coinData;

// const fetchAndCacheCoins = async () => {
//   try {
//     let allCoins: any[] = [];

//     // Fetch additional pages if needed
//     for (let page = 1; page <= 4; page++) {
//       const additionalData = await axios.get(
//         "https://api.coingecko.com/api/v3/coins/markets",
//         {
//           params: {
//             vs_currency: "usd",
//             order: "market_cap_desc",
//             per_page: 250,
//             page: page,
//           },
//           headers: {
//             accept: "application/json",
//           },
//         }
//       );

//       const pageData = additionalData.data;
//       allCoins = [...allCoins, ...pageData];

//       await storeCoinsWithPrisma(allCoins);
//     }

//     console.log("Coin data cached successfully!");
//   } catch (error) {
//     console.error("Error fetching CoinGecko data:", error);
//   } finally {
//     // Disconnect Prisma client when done
//     await prisma.$disconnect();
//   }
// };

// const storeCoinsWithPrisma = async (coins: any[]) => {
//   try {
//     console.log(`Storing ${coins.length} coins in database...`);

//     // Process in smaller batches to avoid timeouts
//     const batchSize = 50;
//     for (let i = 0; i < coins.length; i += batchSize) {
//       const batch = coins.slice(i, i + batchSize);
//       console.log(
//         `Processing batch ${i / batchSize + 1} of ${Math.ceil(
//           coins.length / batchSize
//         )}, size: ${batch.length}`
//       );

//       // Use transaction with increased timeout for each batch
//       await prisma.$transaction(
//         async (tx) => {
//           const upsertPromises = batch.map((coin: any) => {
//             return tx.coin.upsert({
//               where: { id: coin.id },
//               update: {
//                 symbol: coin.symbol,
//                 name: coin.name,
//                 currentPrice: coin.current_price,
//                 marketCap: coin.market_cap,
//                 marketCapRank: coin.market_cap_rank,
//                 volume24h: coin.total_volume,
//                 priceChange24h: coin.price_change_24h,
//                 priceChangePercentage24h: coin.price_change_percentage_24h,
//                 lastUpdated: new Date(coin.last_updated),
//                 fullData: coin,
//                 fetchedAt: new Date(),
//               },
//               create: {
//                 id: coin.id,
//                 symbol: coin.symbol,
//                 name: coin.name,
//                 currentPrice: coin.current_price,
//                 marketCap: coin.market_cap,
//                 marketCapRank: coin.market_cap_rank,
//                 volume24h: coin.total_volume,
//                 priceChange24h: coin.price_change_24h,
//                 priceChangePercentage24h: coin.price_change_percentage_24h,
//                 lastUpdated: new Date(coin.last_updated),
//                 fullData: coin,
//                 fetchedAt: new Date(),
//               },
//             });
//           });

//           return Promise.all(upsertPromises);
//         },
//         {
//           timeout: 15000, // Increase default timeout from 5000ms to 15000ms
//         }
//       );

//       console.log(`Batch ${i / batchSize + 1} completed`);
//     }

//     console.log(`Successfully stored all ${coins.length} coins in database.`);
//   } catch (error) {
//     console.error("Prisma database storage error:", error);
//     throw error;
//   }
// };

// fetchAndCacheCoins();

// setInterval(fetchAndCacheCoins, 600000);

interface FullName {
  firstName: string;
  lastName: string;
}

async function createUser(
  name: string,
  password: string,
  { firstName, lastName }: FullName
) {
  const res = await prisma.user.create({
    data: {
      name,
      firstName: firstName,
      lastName: lastName,
      password,
    },
    select: {
      id: true,
    },
  });

  console.log(res);
}

// createUser("koi", "koimoi420", {
//   firstName: "koi",
//   lastName: "koi",
// });

async function updateUser(name: string, { firstName, lastName }: FullName) {
  const res = await prisma.user.update({
    where: { name: name },
    data: {
      firstName,
      lastName,
    },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  console.log(res);
  return res;
}

const res = await updateUser("koi", {
  firstName: "Koipoi",
  lastName: "moikoi",
});

console.log(res);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
