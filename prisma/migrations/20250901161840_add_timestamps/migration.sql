/*
  Warnings:

  - You are about to drop the column `email` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userEmail]` on the table `participants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `participants` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."participants_email_key";

-- AlterTable
ALTER TABLE "public"."participants" DROP COLUMN "email",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."User";

-- CreateIndex
CREATE UNIQUE INDEX "participants_userEmail_key" ON "public"."participants"("userEmail");
