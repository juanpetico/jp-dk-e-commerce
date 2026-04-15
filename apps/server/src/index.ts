import express, { type Express } from "express";
import cors from "cors";
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

dotenv.config();

const createServer = (): Express => {
    const app = express();
    // Middleware
    app.use(
        cors({
            origin: ["http://localhost:3000", "http://localhost:3001", "https://wide-cycles-nail.loca.lt"],
            credentials: true,
        })
    );
    app
        .disable("x-powered-by")
        .use(express.json({ limit: '1mb' }))
        .use(express.urlencoded({ extended: true, limit: '500kb', parameterLimit: 50 }));

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
