import 'dotenv/config';
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error-handler.js";

import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import shopConfigRoutes from "./routes/shop-config.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import automationRoutes from "./routes/automation.routes.js";
import seedRoutes from "./routes/seed.routes.js";

const parseOrigins = (): string[] => {
    const raw = process.env.CORS_ORIGINS;
    if (raw && raw.trim().length > 0) {
        return raw.split(",").map(o => o.trim()).filter(Boolean);
    }
    return ["http://localhost:3000", "http://localhost:3001"];
};

const buildCorsOptions = () => {
    const allowedOrigins = parseOrigins();
    const vercelSuffix = process.env.CORS_VERCEL_SUFFIX;

    return {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin) return callback(null, true);
            const isAllowed =
                allowedOrigins.includes(origin) ||
                (!!vercelSuffix && origin.endsWith(vercelSuffix));
            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    };
};

const isDev = process.env.NODE_ENV !== "production";

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isDev ? 5000 : 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isDev ? 100 : 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { success: false, message: "Too many authentication attempts, please try again later" },
});

const createApp = (): Express => {
    const app = express();

    app.set("trust proxy", 1);

    app.use(helmet());
    app.use(cors(buildCorsOptions()));
    app
        .disable("x-powered-by")
        .use(express.json({ limit: '1mb' }))
        .use(express.urlencoded({ extended: true, limit: '500kb', parameterLimit: 50 }))
        .use(cookieParser());

    app.use("/api", globalLimiter);
    app.use("/api/auth/login", authLimiter);
    app.use("/api/auth/register", authLimiter);
    app.use("/api/auth/forgot-password", authLimiter);

    app.get("/health", (_, res) => {
        return res.json({
            success: true,
            message: "Server is running",
            timestamp: new Date().toISOString()
        });
    });

    app.use("/api", userRoutes);
    app.use("/api", categoryRoutes);
    app.use("/api", productRoutes);
    app.use("/api", orderRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/coupons", couponRoutes);
    app.use("/api/shop-config", shopConfigRoutes);
    app.use("/api", auditRoutes);
    app.use("/api/automation", automationRoutes);
    app.use("/api/internal", seedRoutes);

    app.use((req, res) => {
        res.status(404).json({ success: false, message: "Route not found" });
    });

    app.use(errorHandler);

    return app;
};

export default createApp();
