/*
  Warnings:

  - You are about to drop the column `earned` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `recipient` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `redeemed` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `Transaction` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "remark" TEXT NOT NULL DEFAULT '',
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    "amount" INTEGER NOT NULL,
    "spent" REAL,
    "relatedId" INTEGER,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "awarded" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "processedById" INTEGER,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "awarded", "createdById", "id", "processed", "processedById", "relatedId", "remark", "spent", "suspicious", "type", "userId") SELECT "amount", "awarded", "createdById", "id", "processed", "processedById", "relatedId", "remark", "spent", "suspicious", "type", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "utorid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "birthday" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'regular',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "suspicious" BOOLEAN DEFAULT false,
    "student" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "resetToken" TEXT,
    "expiresAt" DATETIME
);
INSERT INTO "new_User" ("activated", "avatarUrl", "birthday", "createdAt", "email", "expiresAt", "id", "lastLogin", "name", "password", "points", "resetToken", "role", "student", "suspicious", "utorid", "verified") SELECT "activated", "avatarUrl", "birthday", "createdAt", "email", "expiresAt", "id", "lastLogin", "name", "password", "points", "resetToken", "role", "student", "suspicious", "utorid", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_utorid_key" ON "User"("utorid");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
