const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authenticate');
const usersCtrl = require('../controllers/users');

router.get('/:id', authenticate.employee, usersCtrl.getOne);

module.exports = router;
