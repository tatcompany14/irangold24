const express = require('express');

const router = express.Router();

const { isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  getAllPages, getPageBySlug, createPage, updatePage, deletePage,
} = require('../controllers/page.controller');

router.get('/pages', getAllPages);
router.get('/pages/:slug', getPageBySlug);
router.post('/pages', withAuthAdmin, isAdmin, createPage);
router.put('/pages/:slug', withAuthAdmin, isAdmin, updatePage);
router.delete('/pages/:slug', withAuthAdmin, isAdmin, deletePage);

module.exports = router;
