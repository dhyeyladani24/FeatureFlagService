const { z } = require("zod");

const createFeatureBody = z.object({
  name: z.string().min(1).max(256),
  environment: z.string().min(1).max(64),
  enabled: z.boolean().optional().default(false),
  rollout_percentage: z.coerce.number().int().min(0).max(100).optional().default(0),
  target_users: z.array(z.string().min(1)).default([]),
  target_countries: z
    .array(
      z
        .string()
        .min(2)
        .max(2)
        .transform((c) => c.toUpperCase())
    )
    .default([]),
});

const updateFeatureBody = z
  .object({
    enabled: z.boolean().optional(),
    rollout_percentage: z.coerce.number().int().min(0).max(100).optional(),
    target_users: z.array(z.string().min(1)).optional(),
    target_countries: z
      .array(
        z
          .string()
          .min(2)
          .max(2)
          .transform((c) => c.toUpperCase())
      )
      .optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });

const evaluateBody = z.object({
  featureName: z.string().min(1).max(256),
  environment: z.string().min(1).max(64),
  userId: z.string().min(1).max(256).optional(),
  country: z
    .string()
    .length(2)
    .transform((c) => c.toUpperCase())
    .optional(),
});

const featureKeyParams = z.object({
  environment: z.string().min(1).max(64),
  name: z.string().min(1).max(256),
});

const auditLogsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const listFeaturesQuery = z.object({
  environment: z.string().min(1).max(64).optional(),
});

module.exports = {
  createFeatureBody,
  updateFeatureBody,
  evaluateBody,
  featureKeyParams,
  auditLogsQuery,
  listFeaturesQuery,
};
