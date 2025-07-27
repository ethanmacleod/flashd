-- AlterTable
ALTER TABLE "card" ADD COLUMN     "color" TEXT DEFAULT 'default';

-- CreateTable
CREATE TABLE "custom_color" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_color_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "custom_color" ADD CONSTRAINT "custom_color_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
