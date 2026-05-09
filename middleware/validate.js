const { ZodError } = require('zod');

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
      if (key.startsWith('$') || key.includes('.')) {
        return accumulator;
      }

      accumulator[key] = sanitizeValue(nestedValue);
      return accumulator;
    }, {});
  }

  if (typeof value === 'string') {
    return value.replace(/\u0000/g, '').trim();
  }

  return value;
}

function sanitizeRequest(req, res, next) {
  req.body = sanitizeValue(req.body || {});
  req.params = sanitizeValue(req.params || {});
  req.query = sanitizeValue(req.query || {});
  next();
}

function validateRequest({ body, params, query }) {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body || {});
      }

      if (params) {
        req.params = params.parse(req.params || {});
      }

      if (query) {
        req.query = query.parse(req.query || {});
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        error.statusCode = 400;
      }

      next(error);
    }
  };
}

module.exports = {
  sanitizeRequest,
  validateRequest,
};
