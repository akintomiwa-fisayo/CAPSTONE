const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authenticate');
const usersCtrl = require('../controllers/users');

router.get('/:id', authenticate.employee, usersCtrl.getOne);
router.get('/:id/articles', authenticate.employee, usersCtrl.getArticles);
router.get('/:id/gifs', authenticate.employee, usersCtrl.getGifs);

module.exports = router;
