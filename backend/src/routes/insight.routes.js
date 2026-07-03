const { Router } = require('express');
const controller = require('../controllers/insight.controller');
const validateQuery = require('../middlewares/validateQuery');

const router = Router();

router.get('/filters', controller.getFilters);
router.get('/stats', controller.getStats);
router.get('/:id', controller.getInsightById);
router.get('/', validateQuery, controller.getInsights);

module.exports = router;
