const express = require('express');

const router = express.Router();
// const upload = require('../middleware/multer');
const authenticate = require('../middleware/authenticate');
const articlesCtrl = require('../controllers/articles');

router.post('/', authenticate.employee, articlesCtrl.create);
// router.post('/signin', formParser, authCtrl.signIn);

module.exports = router;
