const express = require('express');

const router = express.Router();

const { withAuth, withAuthAdmin, isAdmin } = require('../middlewares/auth.middleware');
const {
  getWallet, getWalletByUserId,
} = require('../controllers/wallet.controller');

router.get('/wallets/me', withAuth, getWallet);
router.get('/wallets/:userId', withAuthAdmin, isAdmin, getWalletByUserId);

module.exports = router;
