/*
  Warnings:

  - Added the required column `tokenId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Session" ADD COLUMN     "tokenId" TEXT NOT NULL;
