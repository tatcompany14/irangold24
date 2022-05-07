const express = require('express');

const router = express.Router();

const { withAuth } = require('../middlewares/auth.middleware');

const {
  getUserLinkeds, createLinked, deleteLinked,
} = require('../controllers/linked.controller');

router.get('/linkeds/me', withAuth, getUserLinkeds);
router.post('/linkeds', withAuth, createLinked);
router.delete('/linkeds/:id', withAuth, deleteLinked);

module.exports = router;
