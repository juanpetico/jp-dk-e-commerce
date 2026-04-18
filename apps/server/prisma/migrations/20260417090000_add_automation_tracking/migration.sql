-- Campos para tracking idempotente de flujos de automatización (n8n)
ALTER TABLE "Cart" ADD COLUMN "reminderSentAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN "reviewRequestedAt" TIMESTAMP(3);

-- Índices parciales para acelerar consultas del scanner
CREATE INDEX "Cart_reminderSentAt_idx" ON "Cart"("reminderSentAt");
CREATE INDEX "Order_status_reviewRequestedAt_idx" ON "Order"("status", "reviewRequestedAt");
