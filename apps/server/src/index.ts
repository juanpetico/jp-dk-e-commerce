import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error-handler.js";

// Import routes
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import shopConfigRoutes from "./routes/shop-config.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import automationRoutes from "./routes/automation.routes.js";

dotenv.config();

const parseOrigins = (): string[] => {
    const raw = process.env.CORS_ORIGINS;
    if (raw && raw.trim().length > 0) {
        return raw.split(",").map(o => o.trim()).filter(Boolean);
    }
    return ["http://localhost:3000", "http://localhost:3001"];
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

const createServer = (): Express => {
    const app = express();

    app.set("trust proxy", 1);

    // Security headers
    app.use(helmet());

    // CORS
    app.use(
        cors({
            origin: parseOrigins(),
            credentials: true,
        })
    );

    app
        .disable("x-powered-by")
        .use(express.json({ limit: '1mb' }))
        .use(express.urlencoded({ extended: true, limit: '500kb', parameterLimit: 50 }))
        .use(cookieParser());

    // Global rate limit
    app.use("/api", globalLimiter);
    // Aggressive rate limit only on sensitive auth actions (not session checks)
    app.use("/api/auth/login", authLimiter);
    app.use("/api/auth/register", authLimiter);
    app.use("/api/auth/forgot-password", authLimiter);

    // Health check
    app.get("/health", (_, res) => {
        return res.json({
            success: true,
            message: "Server is running",
            timestamp: new Date().toISOString()
        });
    });

    // API Routes
    app.use("/api", userRoutes);
    app.use("/api", categoryRoutes);
    app.use("/api", productRoutes);
    app.use("/api", orderRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/coupons", couponRoutes);
    app.use("/api/shop-config", shopConfigRoutes);
    app.use("/api", auditRoutes);
    app.use("/api/automation", automationRoutes);

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: "Route not found",
        });
    });

    // Error handler (must be last)
    app.use(errorHandler);

    return app;
};

const port = process.env.PORT || 5001;
const server = createServer();

server.listen(port, () => {
    console.log(`🚀 API server running on port ${port}`);
    console.log(`📍 Health check: http://localhost:${port}/health`);
    console.log(`🔑 Environment: ${process.env.NODE_ENV || "development"}`);
});
