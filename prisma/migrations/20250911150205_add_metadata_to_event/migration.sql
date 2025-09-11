/*
  Warnings:

  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `metadata` on the `events` table. All the data in the column will be lost.
  - The `signupStarts` column on the `events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `signupEnds` column on the `events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `forms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `participants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `startDate` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endDate` on the `events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."forms" DROP CONSTRAINT "forms_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."participants" DROP CONSTRAINT "participants_formId_fkey";

-- AlterTable
ALTER TABLE "public"."events" DROP CONSTRAINT "events_pkey",
DROP COLUMN "metadata",
ADD COLUMN     "metaData" JSONB,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "place" DROP NOT NULL,
DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "minParticipants" DROP NOT NULL,
ALTER COLUMN "maxParticipants" DROP NOT NULL,
DROP COLUMN "signupStarts",
ADD COLUMN     "signupStarts" TIMESTAMP(3),
DROP COLUMN "signupEnds",
ADD COLUMN     "signupEnds" TIMESTAMP(3),
ALTER COLUMN "price" DROP NOT NULL,
ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "events_id_seq";

-- AlterTable
ALTER TABLE "public"."forms" DROP CONSTRAINT "forms_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "eventId" SET DATA TYPE TEXT,
ADD CONSTRAINT "forms_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "forms_id_seq";

-- AlterTable
ALTER TABLE "public"."participants" DROP CONSTRAINT "participants_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "formId" SET DATA TYPE TEXT,
ADD CONSTRAINT "participants_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "participants_id_seq";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."forms" ADD CONSTRAINT "forms_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participants" ADD CONSTRAINT "participants_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
