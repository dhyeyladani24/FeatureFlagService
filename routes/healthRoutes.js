const express = require("express");
const db = require("../config/db");
const redisClient = require("../config/redis");

const router = express.Router();

router.get("/", async (req, res) => {
  const payload = {
    status: "ok",
    checks: {
      postgres: "unknown",
      redis: "unknown",
    },
  };

  try {
    await db.query("SELECT 1");
    payload.checks.postgres = "ok";
  } catch (err) {
    payload.checks.postgres = "error";
    payload.status = "degraded";
  }

  try {
    if (!redisClient.isOpen) {
      throw new Error("Redis not connected");
    }
    const pong = await redisClient.ping();
    payload.checks.redis = pong === "PONG" ? "ok" : "error";
    if (payload.checks.redis !== "ok") {
      payload.status = "degraded";
    }
  } catch (err) {
    payload.checks.redis = "error";
    payload.status = "degraded";
  }

  const code = payload.status === "ok" ? 200 : 503;
  res.status(code).json(payload);
});

module.exports = router;
