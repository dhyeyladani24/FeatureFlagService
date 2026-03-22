const redisClient = require("../config/redis");

/** Read on each request so `dotenv` + `.env` are the source of truth (not `.env.example`). */
function getWindowSeconds() {
  const n = Number(process.env.RATE_LIMIT_WINDOW_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 60;
}

function getMaxRequests() {
  const n = Number(process.env.RATE_LIMIT_MAX_REQUESTS);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

const clientKey = (req) => {
  const headerId = req.headers["x-user-id"];
  if (headerId !== undefined && headerId !== null && String(headerId).trim() !== "") {
    return String(headerId).trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

/**
 * Sliding window: drop expired members, count current window, reject without recording
 * if at capacity, otherwise record this request.
 */
const rateLimiter = async (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }

  const WINDOW_SIZE = getWindowSeconds();
  const MAX_REQUESTS = getMaxRequests();

  try {
    const userId = clientKey(req);
    const key = `rate_limit:${userId}`;

    const now = Date.now();
    const windowStart = now - WINDOW_SIZE * 1000;

    await redisClient.zRemRangeByScore(key, 0, windowStart);
    const count = await redisClient.zCard(key);

    if (Number(count) >= MAX_REQUESTS) {
      res.set("Retry-After", String(WINDOW_SIZE));
      return res.status(429).json({
        message: "Too many requests (rate limited)",
        retryAfterSeconds: WINDOW_SIZE,
      });
    }

    await redisClient.zAdd(key, {
      score: now,
      value: `${now}-${Math.random()}`,
    });
    await redisClient.expire(key, WINDOW_SIZE);

    next();
  } catch (error) {
    console.error("Rate limiter error:", error.message);
    next();
  }
};

module.exports = rateLimiter;
