/*
  Warnings:

  - A unique constraint covering the columns `[cardholder_Id]` on the table `CardDetails` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[card_id]` on the table `CardDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CardDetails_cardholder_Id_key" ON "CardDetails"("cardholder_Id");

-- CreateIndex
CREATE UNIQUE INDEX "CardDetails_card_id_key" ON "CardDetails"("card_id");
