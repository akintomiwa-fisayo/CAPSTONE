const express = require('express');

const router = express.Router();
const upload = require('../middleware/multer');
const dbDepts = require('../middleware/get-db-departments');
const dbUserEmails = require('../middleware/get-db-usersEmail');
const authenticate = require('../middleware/authenticate');
const authCtrl = require('../controllers/auth');

router.post('/create-user', authenticate.admin, upload.single('passport'), dbDepts, dbUserEmails, authCtrl.createUser);
router.post('/signin', authCtrl.signIn);
router.patch('/password', authenticate.employee, authCtrl.changePasword);

module.exports = router;
