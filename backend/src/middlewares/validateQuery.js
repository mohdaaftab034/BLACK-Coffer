function validatePagination(val, name) {
  const num = parseInt(val, 10);
  if (isNaN(num) || num < 1) {
    const err = new Error(`Query parameter "${name}" must be a positive integer`);
    err.statusCode = 400;
    throw err;
  }
  return num;
}

function validateQuery(req, _res, next) {
  const { page, limit, sortOrder } = req.query;

  if (page !== undefined) {
    req.query.page = validatePagination(page, 'page');
  }
  if (limit !== undefined) {
    req.query.limit = validatePagination(limit, 'limit');
  }
  if (sortOrder !== undefined) {
    const order = sortOrder.toLowerCase();
    if (order !== 'asc' && order !== 'desc') {
      const err = new Error('Query parameter "sortOrder" must be "asc" or "desc"');
      err.statusCode = 400;
      throw err;
    }
    req.query.sortOrder = order;
  }

  next();
}

module.exports = validateQuery;
