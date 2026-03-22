const { increment } = require("../services/metricsService");

const shouldIgnore = (path) =>
  path === "/metrics" || path === "/health";

const metricsMiddleware = (req, res, next) => {
  if (shouldIgnore(req.path)) {
    return next();
  }

  increment("totalRequests");

  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      increment("successRequests");
    } else {
      increment("failedRequests");
    }
  });

  next();
};

module.exports = metricsMiddleware;
