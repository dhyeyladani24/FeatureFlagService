const featureService = require("./featureService");
const { simpleHashToPercentage } = require("../utils/hash");

const evaluateFeature = async ({ featureName, environment, userId, country }) => {
  const result = await featureService.getFeature(featureName, environment);

  if (!result || !result.feature) {
    return {
      featureName,
      enabled: false,
      reason: "FEATURE_NOT_FOUND",
    };
  }

  const feature = result.feature;

  if (!feature.enabled) {
    return {
      featureName,
      enabled: false,
      reason: "FEATURE_DISABLED",
    };
  }

  if (userId && Array.isArray(feature.target_users) && feature.target_users.includes(userId)) {
    return {
      featureName,
      enabled: true,
      reason: "TARGET_USER_MATCH",
    };
  }

  if (
    country &&
    Array.isArray(feature.target_countries) &&
    feature.target_countries.includes(country.toUpperCase())
  ) {
    return {
      featureName,
      enabled: true,
      reason: "TARGET_COUNTRY_MATCH",
    };
  }

  if (!userId) {
    return {
      featureName,
      enabled: false,
      reason: "USER_ID_REQUIRED_FOR_ROLLOUT",
    };
  }

  const bucket = simpleHashToPercentage(`${featureName}:${userId}`);
  const rolloutPercentage = Number(feature.rollout_percentage) || 0;

  if (bucket < rolloutPercentage) {
    return {
      featureName,
      enabled: true,
      reason: "ROLLOUT_MATCH",
      bucket,
      rollout_percentage: rolloutPercentage,
    };
  }

  return {
    featureName,
    enabled: false,
    reason: "ROLLOUT_MISS",
    bucket,
    rollout_percentage: rolloutPercentage,
  };
};

module.exports = {
  evaluateFeature,
};
