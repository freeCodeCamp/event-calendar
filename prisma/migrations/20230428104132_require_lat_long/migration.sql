/*
  Warnings:

  - Made the column `latitude` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;
