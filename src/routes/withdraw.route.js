const express = require('express');

const router = express.Router();

const { withAuth, isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  getAllWithdraws, getAllWithdrawsByUser, getWithdrawById, getWithdrawByIdAdmin,
  createWithdraw, acceptWithdraw, declineWithdraw,
} = require('../controllers/withdraw.controller');

router.get('/withdraws/admin', withAuthAdmin, isAdmin, getAllWithdraws);
router.get('/withdraws', withAuth, getAllWithdrawsByUser);
router.get('/withdraws/:id', withAuth, getWithdrawById);
router.get('/withdraws/:id/admin', withAuthAdmin, isAdmin, getWithdrawByIdAdmin);
router.post('/withdraws', withAuth, createWithdraw);
router.put('/withdraws/:id/accept', withAuthAdmin, isAdmin, acceptWithdraw);
router.put('/withdraws/:id/decline', withAuthAdmin, isAdmin, declineWithdraw);

module.exports = router;
