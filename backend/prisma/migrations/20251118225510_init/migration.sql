-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Promotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "minSpending" INTEGER,
    "rate" REAL,
    "points" INTEGER,
    "type" TEXT NOT NULL
);
INSERT INTO "new_Promotion" ("description", "endTime", "id", "minSpending", "name", "points", "rate", "startTime", "type") SELECT "description", "endTime", "id", "minSpending", "name", "points", "rate", "startTime", "type" FROM "Promotion";
DROP TABLE "Promotion";
ALTER TABLE "new_Promotion" RENAME TO "Promotion";
CREATE UNIQUE INDEX "Promotion_name_key" ON "Promotion"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
