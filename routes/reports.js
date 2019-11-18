const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authenticate');
const reportsCtrl = require('../controllers/reports');

router.get('/', authenticate.admin, reportsCtrl.getAll);
router.patch('/:id', authenticate.admin, reportsCtrl.attendToOne);

module.exports = router;
