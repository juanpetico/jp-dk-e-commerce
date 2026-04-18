import app from "./app.js";

const port = process.env.PORT || 5001;

app.listen(port, () => {
    console.log(`🚀 API server running on port ${port}`);
    console.log(`📍 Health check: http://localhost:${port}/health`);
    console.log(`🔑 Environment: ${process.env.NODE_ENV || "development"}`);
});
