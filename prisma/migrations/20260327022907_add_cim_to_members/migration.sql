/*
  Warnings:

  - A unique constraint covering the columns `[cim]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN     "cim" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "members_cim_key" ON "members"("cim");
