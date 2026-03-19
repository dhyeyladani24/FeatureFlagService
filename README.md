# Feature Flag Service

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![REST API](https://img.shields.io/badge/REST-API-0052FF?style=for-the-badge)

This project replicates how modern large-scale systems safely release and control features in production without requiring code redeployment. It demonstrates a real-world backend architecture where features can be dynamically toggled, gradually rolled out, and targeted to specific users or regions.

The system is designed with a strong focus on backend engineering principles, including clean API design, modular service-based architecture, deterministic evaluation logic, and performance optimization through caching. It also incorporates production grade concepts such as rate limiting to prevent abuse, centralized error handling for reliability, and metrics & observability to monitor system behavior.

Overall, this project serves as a practical implementation of scalable backend patterns used in companies like Amazon and Netflix, making it highly valuable for understanding real world system design.

---

## Overview

Feature Flag Service is a backend system that enables **dynamic feature control without redeploying code**.

It allows developers to:
- Turn features ON/OFF instantly
- Roll out features gradually
- Target specific users or regions
- Monitor system behavior in real-time

This project mimics how large-scale systems (like Amazon, Netflix) safely release features in production.

---

## Features

### 1. Feature Management
- Create and update feature flags
- Environment-based configuration (`dev`, `prod`)
- Store targeting rules (users, countries)
- Supports gradual rollout using percentage

---

### 2. Feature Evaluation Engine
- Determines whether a feature should be enabled for a user
- Uses **deterministic hashing** for rollout consistency
- Supports:
  - User targeting
  - Country targeting
  - Percentage-based rollout

---

### 3. Redis Caching (Performance Optimization)
- Implements **cache-aside pattern**
- Reduces database load significantly
- Fast feature retrieval from cache
- Automatic cache invalidation on updates

---

### 4. Metrics & Observability
- Tracks:
  - Total API requests
  - Successful vs failed requests
  - Cache hits & misses
- Helps in understanding system performance

---

### 5. Rate Limiting (Sliding Window)
- Prevents API abuse
- Per-user rate limiting using `x-user-id`
- Implemented using **Redis sorted sets**
- Sliding window algorithm (production-grade)

---

### 6. Audit Logging
- Tracks all feature changes
- Stores:
  - Old values
  - New values
  - Action type (CREATE / UPDATE)
- Useful for debugging and traceability

---
## Project Structure

```bash
feature-flag-service/
│
├── config/
│   ├── db.js
│   └── redis.js
│
├── controllers/
│   ├── evaluationController.js
│   └── featureController.js
│
├── middleware/
│   └── errorHandler.js
│   └── metricsMiddleware.js
│   └── rateLimiter.js
│
├── routes/
│   ├── evaluationRoutes.js
│   └── featureRoutes.js
│   └── metricsRoutes.js
│
├── services/
│   ├── auditService.js
│   ├── cacheService.js
│   ├── evaluationService.js
│   └── featureService.js
│   └── metricsService.js
│
├── sql/
│   └── schema.sql
│
├── utils/
│   └── hash.js
│
├── .env
├── .gitignore
├── package-lock.json
├── package.json
└── server.js
