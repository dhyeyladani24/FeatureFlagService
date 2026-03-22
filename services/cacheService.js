const redisClient = require("../config/redis");
const { increment } = require("./metricsService");

const ttlSeconds = () => {
  const n = Number(process.env.FEATURE_CACHE_TTL_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 300;
};

/**
 * When SKIP_CACHE is "truthy" in the sense of disabling Redis: true / 1 / yes / on.
 * false / 0 / no / off / unset → use Redis cache.
 */
const cacheSkipped = () => {
  const v = process.env.SKIP_CACHE;
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  if (s === "" || s === "false" || s === "0" || s === "no" || s === "off") {
    return false;
  }
  return s === "true" || s === "1" || s === "yes" || s === "on";
};

/** Log cache decisions (SET/MISS/HIT). Set CACHE_LOG=false to silence. Default: on. */
const cacheLogEnabled = () => {
  const v = process.env.CACHE_LOG;
  if (v === undefined || v === null) return true;
  const s = String(v).trim().toLowerCase();
  return s !== "false" && s !== "0" && s !== "no";
};

const logCache = (...args) => {
  if (cacheLogEnabled()) {
    console.log("[cache]", ...args);
  }
};

const getCacheKey = (name, environment) =>
  `feature:${String(environment)}:${String(name)}`;

/** pg can surface bigint; JSON.stringify throws on BigInt without a replacer. */
const serializeFeature = (feature) =>
  JSON.stringify(feature, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );

const toUtf8String = (data) => {
  if (data == null) return null;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (typeof data === "string") return data;
  return String(data);
};

const getFeatureFromCache = async (name, environment) => {
  if (cacheSkipped()) {
    logCache("SKIP get (SKIP_CACHE is on):", getCacheKey(name, environment));
    return null;
  }

  const key = getCacheKey(name, environment);

  let raw;
  try {
    raw = await redisClient.get(key);
  } catch (err) {
    console.error("Redis GET (feature cache):", err.message);
    increment("cacheMisses");
    return null;
  }

  const str = toUtf8String(raw);
  if (!str) {
    logCache("MISS", key);
    increment("cacheMisses");
    return null;
  }

  try {
    const parsed = JSON.parse(str);
    logCache("HIT", key);
    increment("cacheHits");
    return parsed;
  } catch (err) {
    console.error("Redis feature cache JSON parse:", err.message);
    try {
      await redisClient.del(key);
    } catch {
      /* ignore */
    }
    increment("cacheMisses");
    return null;
  }
};

/**
 * Store feature JSON under the same Redis key used by getFeatureFromCache.
 * Always pass cacheKeyName + cacheKeyEnvironment from the route/service (URL params),
 * not only row fields — pg row property names can differ and would break key matching.
 */
const setFeatureInCache = async (feature, cacheKeyName, cacheKeyEnvironment) => {
  if (cacheSkipped()) {
    logCache("SKIP set (SKIP_CACHE is on)");
    return;
  }

  const name = cacheKeyName ?? feature?.name;
  const env = cacheKeyEnvironment ?? feature?.environment;
  if (name == null || String(name).length === 0 || env == null || String(env).length === 0) {
    console.error("setFeatureInCache: missing name/environment for Redis key", {
      cacheKeyName,
      cacheKeyEnvironment,
      rowKeys: feature ? Object.keys(feature) : [],
    });
    return;
  }

  const key = getCacheKey(name, env);
  const ttl = ttlSeconds();
  let payload;
  try {
    payload = serializeFeature(feature);
  } catch (err) {
    console.error("Redis SET (feature cache) serialize:", err.message);
    return;
  }

  try {
    await redisClient.set(key, payload, { EX: ttl });
    logCache("SET ok", key, `TTL ${ttl}s`, `payload ${payload.length} bytes`);
  } catch (err) {
    console.error("Redis SET (feature cache):", err.message);
  }
};

const deleteFeatureFromCache = async (name, environment) => {
  if (cacheSkipped()) {
    return;
  }

  const key = getCacheKey(name, environment);
  try {
    await redisClient.del(key);
    logCache("DEL", key);
  } catch (err) {
    console.error("Redis DEL (feature cache):", err.message);
  }
};

/** For server startup: is Redis feature cache active? */
const getCacheStartupInfo = () => ({
  skipped: cacheSkipped(),
  skipEnvRaw: process.env.SKIP_CACHE,
  cacheLog: cacheLogEnabled(),
});

module.exports = {
  getFeatureFromCache,
  setFeatureInCache,
  deleteFeatureFromCache,
  getCacheStartupInfo,
};
