const redisClient = require("../config/redis");
const { increment } = require("./metricsService");

const getCacheKey = (name, environment) => {
  return `feature:${environment}:${name}`;
};

const getFeatureFromCache = async (name, environment) => {
  console.log("getFeatureFromCache CALLED"); 

  const key = getCacheKey(name, environment);
  const data = await redisClient.get(key);

  console.log("👉 Redis returned:", data); 

  if (data) {
    console.log("⚡ CACHE HIT");
    increment("cacheHits");
    return JSON.parse(data);
  }

  console.log("CACHE MISS");
  increment("cacheMisses");
  return null;
};

const setFeatureInCache = async (feature) => {
  const key = getCacheKey(feature.name, feature.environment);

  await redisClient.set(key, JSON.stringify(feature), {
    EX: 300,
  });
};

const deleteFeatureFromCache = async (name, environment) => {
  const key = getCacheKey(name, environment);
  await redisClient.del(key);
};

module.exports = {
  getFeatureFromCache,
  setFeatureInCache,
  deleteFeatureFromCache,
};