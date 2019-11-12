const express = require('express');

const router = express.Router();
// const upload = require('../middleware/multer');
const authenticate = require('../middleware/authenticate');
const articlesCtrl = require('../controllers/articles');

router.post('/', authenticate.employee, articlesCtrl.create);
router.patch('/:id', authenticate.employee, articlesCtrl.modify);

module.exports = router;
