-- AlterTable
ALTER TABLE "card" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "review_session" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalCards" INTEGER NOT NULL,
    "reviewedCards" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "skippedCards" INTEGER NOT NULL DEFAULT 0,
    "averageDifficulty" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_log" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "reviewSessionId" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "wasSkipped" BOOLEAN NOT NULL DEFAULT false,
    "wasFavorited" BOOLEAN NOT NULL DEFAULT false,
    "responseTime" INTEGER,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "review_session" ADD CONSTRAINT "review_session_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_session" ADD CONSTRAINT "review_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_log" ADD CONSTRAINT "review_log_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_log" ADD CONSTRAINT "review_log_reviewSessionId_fkey" FOREIGN KEY ("reviewSessionId") REFERENCES "review_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
