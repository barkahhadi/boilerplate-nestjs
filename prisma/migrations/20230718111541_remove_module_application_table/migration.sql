/*
  Warnings:

  - You are about to drop the column `defaultRoute` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `zoneId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `zones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "userRoles" DROP CONSTRAINT "userRoles_userId_fkey";

-- DropForeignKey
ALTER TABLE "userRoles" DROP CONSTRAINT "userRoles_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_zoneId_fkey";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "defaultRoute";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "zoneId",
ADD COLUMN     "officeId" VARCHAR(100);

-- DropTable
DROP TABLE "applications";

-- DropTable
DROP TABLE "modules";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "userRoles";

-- DropTable
DROP TABLE "zones";

-- CreateTable
CREATE TABLE "offices" (
    "id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
