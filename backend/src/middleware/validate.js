function checkFields(data, allowedFields, requiredFields) {
  for (const f of requiredFields) {
    if (!(f in data)) {
      return { valid: false };
    }
  }


  const extra = Object.keys(data).filter(k => !allowedFields.includes(k) && k !== 'avatar');
  if (extra.length > 0) {
    return { valid: false };
  }

  return { valid: true };
}

function validateFields(allowedFields, requiredFields = [], typeRules = {}) {
  return (req, res, next) => {
    const body = req.body || {};

    const check = checkFields(body, allowedFields, requiredFields);
    if (!check.valid) {
      return res.status(400).json({ error: "Bad Request" });
    }

    for (const [field, expectedType] of Object.entries(typeRules)) {
      if (field in body) {
        const value = body[field];

        if (value === null) {
        if (!requiredFields.includes(field)) {
            delete body[field]; 
            continue;
          } else {
            return res.status(400).json({ error: "Bad Request" });
          }
        }
        switch (expectedType) {
          case "array":
            if (!Array.isArray(value)) {
              return res.status(400).json({ error: `Bad Request` });
          }
          break;

          case "number":
            if (typeof value !== "number" || Number.isNaN(value)) {
              return res.status(400).json({ error: `Bad Request` });
          }
          break;

          case "string":
            if (typeof value !== "string") {
              return res.status(400).json({ error: `Bad Request` });
          }
          break;

          case "boolean":
            if (typeof value !== "boolean") {
              return res.status(400).json({ error: `Bad Request` });
          }
          break;

          default:
            if (typeof value !== expectedType) {
              return res.status(400).json({ error: `Bad Request` });
          }
          break;
          }
      }
    }

    next();
  };
}

function validateQuery(allowedFields, requiredFields = [], typeRules = {}) {
  return (req, res, next) => {
    const query = req.query || {};

    const check = checkFields(query, allowedFields, requiredFields);
    if (!check.valid) {
      return res.status(400).json({ error: `Bad Request` });
    }

    for (const [field, expectedType] of Object.entries(typeRules)) {
      if (field in query) {
        const value = query[field];
        
        if (value == null || value === '') {
          return res.status(400).json({ error: `Bad Request` });
        }

        switch (expectedType) {
          case "number": {
            const num = Number(value);
            if (isNaN(num)) {
              return res.status(400).json({ error: `Bad Request` });
            }
            req.query[field] = num; 
            break;
          }

          case "boolean": {
            if (value === "true") {
              req.query[field] = true;
            } else if (value === "false") {
              req.query[field] = false;
            } else {
              return res.status(400).json({ error: `Bad Request` });
            }
            break;
          }

          case "string":
            break;

          default:
            return res.status(400).json({ error: `Bad Request` });
        }
      }
    }

    next();
  };
}

module.exports = { validateFields, validateQuery };

