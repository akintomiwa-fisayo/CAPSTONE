const express = require('express');

const router = express.Router();
// const upload = require('../middleware/multer');
const authenticate = require('../middleware/authenticate');
const articlesCtrl = require('../controllers/articles');

router.post('/', authenticate.employee, articlesCtrl.create);
router.get('/:id', authenticate.employee, articlesCtrl.getOne);
router.patch('/:id', authenticate.employee, articlesCtrl.modify);
router.delete('/:id', authenticate.employee, articlesCtrl.delete);
router.post('/:id/comment', authenticate.employee, articlesCtrl.comment);


module.exports = router;
