const express = require('express');

const router = express.Router();

const { withAuth, isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  updateMerchant, updateMerchantAdmin, getAllMerchants, getMerchantById,
  deleteMerchant, createMerchant,
} = require('../controllers/merchant.controller');

router.get('/merchants', withAuthAdmin, isAdmin, getAllMerchants);
router.get('/merchants/:id', withAuthAdmin, isAdmin, getMerchantById);
router.post('/merchants', withAuthAdmin, isAdmin, createMerchant);
router.put('/merchants/me', withAuth, updateMerchant);
router.put('/merchants/:id', withAuthAdmin, isAdmin, updateMerchantAdmin);
router.delete('/merchants/:id', withAuthAdmin, isAdmin, deleteMerchant);

module.exports = router;
