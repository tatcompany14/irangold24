const express = require('express');

const router = express.Router();

const { withAuth, isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  getAllDeposits, getAllDepositsByUser, getDepositById, getDepositByIdAdmin,
  createDeposit, acceptDeposit, declineDeposit,
} = require('../controllers/deposit.controller');

router.get('/deposits/admin', withAuthAdmin, isAdmin, getAllDeposits);
router.get('/deposits', withAuth, getAllDepositsByUser);
router.get('/deposits/:id', withAuth, getDepositById);
router.get('/deposits/:id/admin', withAuthAdmin, isAdmin, getDepositByIdAdmin);
router.post('/deposits', withAuth, createDeposit);
router.put('/deposits/:id/accept', withAuthAdmin, isAdmin, acceptDeposit);
router.put('/deposits/:id/decline', withAuthAdmin, isAdmin, declineDeposit);

module.exports = router;
