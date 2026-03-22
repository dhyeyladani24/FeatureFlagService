const sendValidationError = (res, parsed) =>
  res.status(400).json({
    message: "Validation failed",
    errors: parsed.error.flatten(),
  });

const validateBody =
  (schema) =>
  (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return sendValidationError(res, parsed);
    }
    req.body = parsed.data;
    next();
  };

const validateQuery =
  (schema) =>
  (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return sendValidationError(res, parsed);
    }
    req.query = parsed.data;
    next();
  };

const validateParams =
  (schema) =>
  (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return sendValidationError(res, parsed);
    }
    req.params = parsed.data;
    next();
  };

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};
