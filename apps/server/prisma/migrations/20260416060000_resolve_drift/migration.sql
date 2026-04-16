-- ============================================================
-- Resolve drift: changes applied directly to the DB that were
-- never tracked in migration history. Marked --applied, so
-- Prisma registers them without re-running them.
-- ============================================================

-- AlterTable User: add deactivationReason
ALTER TABLE "User" ADD COLUMN "deactivationReason" TEXT;

-- AlterTable Coupon: add isPublic
ALTER TABLE "Coupon" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable Order: change date from TEXT to TIMESTAMP with default
ALTER TABLE "Order"
  ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3)
    USING "date"::TIMESTAMP(3),
  ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable StoreConfig
CREATE TABLE "StoreConfig" (
    "id"                   TEXT NOT NULL DEFAULT 'default',
    "welcomeCouponCode"    TEXT NOT NULL DEFAULT 'BIENVENIDA',
    "welcomeCouponType"    "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "welcomeCouponValue"   INTEGER NOT NULL DEFAULT 10,
    "vipThreshold"         INTEGER NOT NULL DEFAULT 100000,
    "vipCouponCode"        TEXT NOT NULL DEFAULT 'VIP_GANG',
    "vipCouponType"        "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "vipCouponValue"       INTEGER NOT NULL DEFAULT 15,
    "vipRewardMessage"     TEXT NOT NULL DEFAULT '¡Felicidades! Por tu compra sobre $100.000 has ganado un 15% de descuento.',
    "freeShippingThreshold" INTEGER NOT NULL DEFAULT 50000,
    "baseShippingCost"     INTEGER NOT NULL DEFAULT 3500,
    "defaultTaxRate"       DOUBLE PRECISION NOT NULL DEFAULT 0.19,
    "lowStockThreshold"    INTEGER NOT NULL DEFAULT 5,
    "storeName"            TEXT NOT NULL DEFAULT 'JP DK',
    "supportEmail"         TEXT NOT NULL DEFAULT 'soporte@jpdk.cl',
    "maintenanceMode"      BOOLEAN NOT NULL DEFAULT false,
    "updatedAt"            TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserCoupon
CREATE TABLE "UserCoupon" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "couponId"   TEXT NOT NULL,
    "isUsed"     BOOLEAN NOT NULL DEFAULT false,
    "usedAt"     TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex UserCoupon
CREATE UNIQUE INDEX "UserCoupon_userId_couponId_key" ON "UserCoupon"("userId", "couponId");
CREATE INDEX "UserCoupon_couponId_idx" ON "UserCoupon"("couponId");
CREATE INDEX "UserCoupon_userId_idx" ON "UserCoupon"("userId");

-- AddForeignKey UserCoupon -> User
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey UserCoupon -> Coupon
ALTER TABLE "UserCoupon" ADD CONSTRAINT "UserCoupon_couponId_fkey"
    FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
