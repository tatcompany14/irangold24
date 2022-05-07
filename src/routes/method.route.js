const express = require('express');

const router = express.Router();

const { withAuth, isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  getAllMethods, getMethodById, createMethod, updateMethod, deleteMethod,
} = require('../controllers/method.controller');

router.get('/methods', withAuth, getAllMethods);
router.get('/methods/admin', withAuthAdmin, isAdmin, getAllMethods);
router.get('/methods/:id/admin', withAuthAdmin, isAdmin, getMethodById);
router.get('/methods/:id', withAuth, getMethodById);
router.post('/methods', withAuthAdmin, isAdmin, createMethod);
router.put('/methods/:id', withAuthAdmin, isAdmin, updateMethod);
router.delete('/methods/:id', withAuthAdmin, isAdmin, deleteMethod);

module.exports = router;
