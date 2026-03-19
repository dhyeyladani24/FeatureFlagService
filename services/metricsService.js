const metrics = {
  totalRequests: 0,
  successRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
};

const increment = (key) => {
  if (metrics[key] !== undefined) {
    metrics[key]++;
  }
};

const getMetrics = () => metrics;

module.exports = {
  increment,
  getMetrics,
};