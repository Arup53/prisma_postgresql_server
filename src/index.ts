import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Ulla ulla jinga laga");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

let coinData;

const fetchAndCacheCoins = async () => {
  try {
    let allCoins: any[] = [];

    // Fetch additional pages if needed
    for (let page = 1; page <= 4; page++) {
      const additionalData = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 250,
            page: page,
          },
          headers: {
            accept: "application/json",
          },
        }
      );

      const pageData = additionalData.data;
      allCoins = [...allCoins, ...pageData];
    }

    console.log(allCoins);

    console.log("Coin data cached successfully!");
  } catch (error) {
    console.error("Error fetching CoinGecko data:", error);
  }
};

setInterval(fetchAndCacheCoins, 120000);
