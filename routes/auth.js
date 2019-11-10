const express = require('express');

const router = express.Router();
const formParse = require('../middleware/formParser');
const dbDepts = require('../middleware/get-db-departments');
const dbUserEmails = require('../middleware/get-db-usersEmail');
const authenticate = require('../middleware/authenticate');
const authCtrl = require('../controllers/auth');

router.post('/create-user', authenticate.admin, formParse, dbDepts, dbUserEmails, authCtrl.createUser);
// router.post('/login', authCtrl.login);

module.exports = router;
