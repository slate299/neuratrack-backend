-- AlterTable
ALTER TABLE "EmergencyEvent" ADD COLUMN     "autoTriggered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contactsNotified" JSONB,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3);
