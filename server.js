const express = require("express");
const dotenv = require("dotenv");
const redisClient = require("./config/redis");

const featureRoutes = require("./routes/featureRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const metricsMiddleware = require("./middleware/metricsMiddleware");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");

dotenv.config();

const app = express();

app.use(express.json());
console.log("metricsMiddleware:", typeof metricsMiddleware);
console.log("metricsRoutes:", typeof metricsRoutes);
console.log("errorHandler:", typeof errorHandler);
// ✅ GLOBAL MIDDLEWARE

app.use(rateLimiter);
app.use(metricsMiddleware);

app.get("/", (req, res) => {
  res.json({ message: "Feature Flag Service is running" });
});

// ✅ ROUTES
app.use("/features", featureRoutes);
app.use("/evaluate", evaluationRoutes);
app.use("/metrics", metricsRoutes);

// ✅ ERROR HANDLER (always last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Connected to Redis");
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
  }
}

startServer();