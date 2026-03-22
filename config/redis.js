const redis = require("redis");

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const client = redis.createClient({ url });

client.on("error", (err) => {
  console.error("Redis client error:", err.message);
});

module.exports = client;
