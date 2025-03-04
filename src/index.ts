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

// interface FullName {
//   firstName: string;
//   lastName: string;
// }

// async function getUser(name: string) {
//   const res = await prisma.user.findUnique({
//     where: { name: name },
//     select: {
//       id: true,
//       name: true,
//     },
//   });

//   return res;
// }

// async function createUser(
//   name: string,
//   password: string,
//   { firstName, lastName }: FullName
// ) {
//   const res = await prisma.user.create({
//     data: {
//       name,
//       firstName: firstName,
//       lastName: lastName,
//       password,
//     },
//     select: {
//       id: true,
//     },
//   });

//   console.log(res);
// }

// createUser("koi", "koimoi420", {
//   firstName: "koi",
//   lastName: "koi",
// });

// async function updateUser(name: string, { firstName, lastName }: FullName) {
//   const res = await prisma.user.update({
//     where: { name: name },
//     data: {
//       firstName,
//       lastName,
//     },
//     select: {
//       firstName: true,
//       lastName: true,
//     },
//   });

//   console.log(res);
//   return res;
// }

// const res = await updateUser("koi", {
//   firstName: "Koipoi",
//   lastName: "moikoi",
// });

interface PriceChangePercentage {
  [key: string]: number; // Ensures that `usd` and other currencies are numbers
}

interface CoinData {
  price_change_percentage_24h: PriceChangePercentage;
}

interface CoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data: CoinData; // Now explicitly typed
}

interface TrendingCoin {
  item: CoinItem;
}

interface TrendingCoinsResponse {
  coins: TrendingCoin[];
}

async function fetchCoinAndMarketCap() {
  const resCoin = await axios.get<TrendingCoinsResponse>(
    "https://api.coingecko.com/api/v3/search/trending",
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const newArr: TrendingCoin[] = resCoin.data.coins.slice(0, 3);

  const resMarket = await axios.get("https://api.coingecko.com/api/v3/global");
  const obj = {
    marketCap: resMarket.data.data.total_market_cap.usd,
    change: resMarket.data.data.market_cap_change_percentage_24h_usd,
  };

  console.log(obj);
  await insertCoinAndMarketInfo(newArr, obj);
}

async function insertCoinAndMarketInfo(
  coinArr: TrendingCoin[],
  marketObj: any
) {
  return await prisma.$transaction(async (tx) => {
    await tx.trending.deleteMany();
    await tx.marketCap.deleteMany();

    const coinInsert = await Promise.all(
      coinArr.map((coin: TrendingCoin) =>
        tx.trending.create({
          data: {
            name: coin.item.name,
            image: coin.item.small,
            change: coin.item.data.price_change_percentage_24h.usd,
          },
        })
      )
    );

    const marketCapInsert = await tx.marketCap.create({
      data: {
        capital: marketObj.marketCap,
        change: marketObj.change,
      },
    });
    return { coinInsert, marketCapInsert };
  });
}

fetchCoinAndMarketCap();

setInterval(fetchCoinAndMarketCap, 3 * 60 * 1000);

// const res = await getUser("koi");

// console.log(res);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
