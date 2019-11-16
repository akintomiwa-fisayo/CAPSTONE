const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authenticate');
const reportsCtrl = require('../controllers/reports');

router.get('/', authenticate.admin, reportsCtrl.getAll);

module.exports = router;
