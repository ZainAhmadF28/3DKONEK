-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GalleryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "posterUrl" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "GalleryItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GalleryItem_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GalleryItem" ("authorId", "category", "createdAt", "description", "fileUrl", "id", "isPaid", "posterUrl", "price", "title") SELECT "authorId", "category", "createdAt", "description", "fileUrl", "id", "isPaid", "posterUrl", "price", "title" FROM "GalleryItem";
DROP TABLE "GalleryItem";
ALTER TABLE "new_GalleryItem" RENAME TO "GalleryItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
