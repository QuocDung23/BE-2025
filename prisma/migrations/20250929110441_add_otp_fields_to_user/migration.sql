-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "optExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otpCode" TEXT;
