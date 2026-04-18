-- DropForeignKey: Remove relation to target user
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_targetUserId_fkey";

-- DropIndex: Remove index on targetUserId
DROP INDEX "AuditLog_targetUserId_idx";

-- AlterTable: Replace targetUserId with polymorphic entityType + entityId
ALTER TABLE "AuditLog" DROP COLUMN "targetUserId";
ALTER TABLE "AuditLog" ADD COLUMN "entityType" TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE "AuditLog" ADD COLUMN "entityId"   TEXT NOT NULL DEFAULT '';

-- Remove temporary defaults (columns are now populated)
ALTER TABLE "AuditLog" ALTER COLUMN "entityType" DROP DEFAULT;
ALTER TABLE "AuditLog" ALTER COLUMN "entityId"   DROP DEFAULT;

-- CreateIndex: Composite index for polymorphic lookups
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
