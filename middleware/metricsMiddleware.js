const { increment } = require("../services/metricsService");

const IGNORED_ROUTES = ["/metrics"];

const metricsMiddleware = (req, res, next) => {
  if (IGNORED_ROUTES.includes(req.path)) {
    return next();
  }

  // ✅ track total requests
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