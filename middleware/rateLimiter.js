const redisClient = require("../config/redis");

const WINDOW_SIZE = 60; // seconds
const MAX_REQUESTS = 5;

const rateLimiter = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] || req.ip;
    const key = `rate_limit:${userId}`;

    const currentTime = Date.now();
    const windowStart = currentTime - WINDOW_SIZE * 1000;

    // 🔥 Use Redis transaction (atomic)
    const multi = redisClient.multi();

    // 1. Remove old requests
    multi.zRemRangeByScore(key, 0, windowStart);

    // 2. Get current count
    multi.zCard(key);

    // 3. Add new request
    multi.zAdd(key, {
      score: currentTime,
      value: `${currentTime}-${Math.random()}`,
    });

    // 4. Set expiry
    multi.expire(key, WINDOW_SIZE);

    const results = await multi.exec();

    const requestCount = results[1]; // zCard result

    console.log(`User: ${userId} | Requests: ${requestCount}`);

    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many requests (rate limited)",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error.message);
    next(); // fail-open
  }
};

module.exports = rateLimiter;