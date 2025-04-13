-- CreateTable
CREATE TABLE "CardDetails" (
    "id" TEXT NOT NULL,
    "cardholder_Id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CardDetails" ADD CONSTRAINT "CardDetails_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
