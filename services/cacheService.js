const redisClient = require("../config/redis");

const getCacheKey = (name, environment) => {
  return `feature:${environment}:${name}`;
};

const getFeatureFromCache = async (name, environment) => {
  const key = getCacheKey(name, environment);
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
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