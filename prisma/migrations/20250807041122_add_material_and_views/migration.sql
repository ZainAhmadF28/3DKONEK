-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN "material" TEXT;

-- CreateTable
CREATE TABLE "ChallengeView" (
    "userId" INTEGER NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "challengeId"),
    CONSTRAINT "ChallengeView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChallengeView_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
