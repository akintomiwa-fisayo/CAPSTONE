const express = require('express');

const router = express.Router();
const upload = require('../middleware/multer');
const authenticate = require('../middleware/authenticate');
const gifsCtrl = require('../controllers/gifs');

router.post('/', authenticate.employee, upload.single('image'), gifsCtrl.create);
// router.post('/signin', formParser, authCtrl.signIn);

module.exports = router;
