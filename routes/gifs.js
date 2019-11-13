const express = require('express');

const router = express.Router();
const upload = require('../middleware/multer');
const authenticate = require('../middleware/authenticate');
const gifsCtrl = require('../controllers/gifs');

router.post('/', authenticate.employee, upload.single('image'), gifsCtrl.create);
router.patch('/:id', authenticate.employee, gifsCtrl.modify);
router.delete('/:id', authenticate.employee, gifsCtrl.delete);
router.post('/:id/comment', authenticate.employee, gifsCtrl.comment);

module.exports = router;
