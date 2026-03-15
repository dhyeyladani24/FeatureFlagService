# Feature Flag Service

A backend service to manage, evaluate, and audit feature flags with support for rollout logic, caching, and modular service-based architecture.

This project is designed to simulate how production systems safely release features to users without redeploying code every time. It is a strong backend-focused project for learning API design, service separation, evaluation logic, caching, error handling, and system thinking.

---

## Overview

In modern software systems, teams often want to:

- release a feature gradually
- expose a feature only to some users
- disable a feature instantly if something breaks
- experiment safely in production

This is where **feature flags** help.

A **feature flag** is like a switch for a feature.

Instead of hardcoding a feature permanently into the application, we can decide dynamically:

- whether the feature should be enabled
- which users should get access
- what rollout percentage should be applied
- how to evaluate a feature consistently

This project provides a backend service to manage those feature flags and evaluate them for users.

---

## Why this project matters

This project is more meaningful than a simple CRUD app because it includes real backend engineering concepts such as:

- modular architecture
- controller-service separation
- feature evaluation logic
- rollout strategy
- caching
- audit-related service layer
- SQL schema design
- error-handling middleware
- reusable utility functions

It reflects the kind of backend thinking that is useful for SDE roles.

---

## Tech Stack

- **Node.js**
- **Express.js**
- **Redis**
- **SQL**
- **JavaScript**
- **dotenv**
- **Custom middleware**
- **Service-based backend architecture**

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
│
├── routes/
│   ├── evaluationRoutes.js
│   └── featureRoutes.js
│
├── services/
│   ├── auditService.js
│   ├── cacheService.js
│   ├── evaluationService.js
│   └── featureService.js
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
