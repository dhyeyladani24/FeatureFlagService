const path = require("path");
const fs = require("fs");

const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
  console.warn("WARNING: Missing .env at", envPath, "— copy .env.example to .env");
}
// override: true — project .env wins over shell exports (e.g. SKIP_CACHE=true in ~/.zshrc breaks cache)
require("dotenv").config({ path: envPath, override: true });

const express = require("express");
const cors = require("cors");
const redisClient = require("./config/redis");

const featureRoutes = require("./routes/featureRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const healthRoutes = require("./routes/healthRoutes");
const metricsMiddleware = require("./middleware/metricsMiddleware");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");

const app = express();

app.use(cors());
app.use(express.json());
<<<<<<< HEAD
console.log("metricsMiddleware:", typeof metricsMiddleware);
console.log("metricsRoutes:", typeof metricsRoutes);
console.log("errorHandler:", typeof errorHandler);
// GLOBAL MIDDLEWARE
=======

app.use("/health", healthRoutes);
>>>>>>> 92cab40 (Improvised Code Structure)

app.use(rateLimiter);
app.use(metricsMiddleware);

app.get("/", (req, res) => {
  res.json({ message: "Feature Flag Service is running" });
});

<<<<<<< HEAD
// ROUTES
=======
>>>>>>> 92cab40 (Improvised Code Structure)
app.use("/features", featureRoutes);
app.use("/evaluate", evaluationRoutes);
app.use("/metrics", metricsRoutes);

<<<<<<< HEAD
// ERROR HANDLER (always last)
=======
>>>>>>> 92cab40 (Improvised Code Structure)
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Connected to Redis");
    }

    app.listen(PORT, HOST, () => {
      const { getCacheStartupInfo } = require("./services/cacheService");
      const cacheInfo = getCacheStartupInfo();

      const w = Number(process.env.RATE_LIMIT_WINDOW_SECONDS);
      const m = Number(process.env.RATE_LIMIT_MAX_REQUESTS);
      const rlWindow = Number.isFinite(w) && w > 0 ? w : 60;
      const rlMax = Number.isFinite(m) && m > 0 ? m : 100;
      console.log(`Server listening on http://127.0.0.1:${PORT} (bound to ${HOST}:${PORT})`);
      console.log(
        `Rate limit (from .env): max ${rlMax} requests per ${rlWindow}s window (x-user-id or IP) — WINDOW_SECONDS=time span, MAX_REQUESTS=allowed hits; restart after .env edits`
      );
      console.log(
        `Feature cache: ${cacheInfo.skipped ? "OFF (SKIP_CACHE)" : "ON (Redis)"} | SKIP_CACHE raw=${JSON.stringify(cacheInfo.skipEnvRaw)} | per-request logs: CACHE_LOG=${cacheInfo.cacheLog ? "on" : "off"}`
      );
      console.log(
        `Keep this terminal open while testing. In another tab run: curl -sS http://127.0.0.1:${PORT}/health`
      );
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();
