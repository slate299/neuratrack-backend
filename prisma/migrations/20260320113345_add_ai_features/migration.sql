-- AlterTable
ALTER TABLE "Seizure" ADD COLUMN     "aiConfidence" DOUBLE PRECISION,
ADD COLUMN     "originalNote" TEXT,
ADD COLUMN     "postIctalSymptoms" JSONB,
ADD COLUMN     "symptoms" JSONB,
ADD COLUMN     "triggers" JSONB;

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationAdherence" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "medicationId" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "MedicationAdherence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicationAdherence_userId_medicationId_scheduledFor_key" ON "MedicationAdherence"("userId", "medicationId", "scheduledFor");

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationAdherence" ADD CONSTRAINT "MedicationAdherence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationAdherence" ADD CONSTRAINT "MedicationAdherence_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
