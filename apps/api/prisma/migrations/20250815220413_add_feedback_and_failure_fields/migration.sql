-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "userFeedback" TEXT,
ADD COLUMN     "userRating" INTEGER;
