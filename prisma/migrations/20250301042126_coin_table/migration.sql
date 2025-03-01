-- CreateTable
CREATE TABLE "coins" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentPrice" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "marketCapRank" INTEGER,
    "volume24h" DOUBLE PRECISION,
    "priceChange24h" DOUBLE PRECISION,
    "priceChangePercentage24h" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3),
    "fullData" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coins_pkey" PRIMARY KEY ("id")
);
