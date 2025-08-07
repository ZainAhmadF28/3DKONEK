/*
  Warnings:

  - You are about to drop the column `material` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ChallengeImage` table. All the data in the column will be lost.
  - The primary key for the `ChallengeView` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `authorId` on the `PrivateMessage` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `PublicComment` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `id` to the `ChallengeView` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `PrivateMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `PrivateMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PublicComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "GalleryItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Challenge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "challengerId" INTEGER NOT NULL,
    "solverId" INTEGER,
    CONSTRAINT "Challenge_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Challenge_solverId_fkey" FOREIGN KEY ("solverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Challenge" ("category", "challengerId", "createdAt", "deadline", "description", "id", "reward", "solverId", "status", "title", "updatedAt") SELECT "category", "challengerId", "createdAt", "deadline", "description", "id", "reward", "solverId", "status", "title", "updatedAt" FROM "Challenge";
DROP TABLE "Challenge";
ALTER TABLE "new_Challenge" RENAME TO "Challenge";
CREATE TABLE "new_ChallengeImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "challengeId" INTEGER NOT NULL,
    CONSTRAINT "ChallengeImage_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChallengeImage" ("challengeId", "id", "url") SELECT "challengeId", "id", "url" FROM "ChallengeImage";
DROP TABLE "ChallengeImage";
ALTER TABLE "new_ChallengeImage" RENAME TO "ChallengeImage";
CREATE TABLE "new_ChallengeView" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    CONSTRAINT "ChallengeView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChallengeView_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChallengeView" ("challengeId", "userId", "viewedAt") SELECT "challengeId", "userId", "viewedAt" FROM "ChallengeView";
DROP TABLE "ChallengeView";
ALTER TABLE "new_ChallengeView" RENAME TO "ChallengeView";
CREATE TABLE "new_PrivateMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    CONSTRAINT "PrivateMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrivateMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrivateMessage_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PrivateMessage" ("challengeId", "content", "createdAt", "id") SELECT "challengeId", "content", "createdAt", "id" FROM "PrivateMessage";
DROP TABLE "PrivateMessage";
ALTER TABLE "new_PrivateMessage" RENAME TO "PrivateMessage";
CREATE TABLE "new_Proposal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    CONSTRAINT "Proposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Proposal_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Proposal" ("challengeId", "createdAt", "id", "status") SELECT "challengeId", "createdAt", "id", "status" FROM "Proposal";
DROP TABLE "Proposal";
ALTER TABLE "new_Proposal" RENAME TO "Proposal";
CREATE TABLE "new_PublicComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    CONSTRAINT "PublicComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublicComment_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PublicComment" ("challengeId", "content", "createdAt", "id") SELECT "challengeId", "content", "createdAt", "id" FROM "PublicComment";
DROP TABLE "PublicComment";
ALTER TABLE "new_PublicComment" RENAME TO "PublicComment";
CREATE TABLE "new_Submission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("challengeId", "createdAt", "id", "status") SELECT "challengeId", "createdAt", "id", "status" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
