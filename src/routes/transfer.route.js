const express = require('express');

const router = express.Router();

const { withAuth, isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  createTransfer, getAllTransfers, getAllTransfersByUser,
} = require('../controllers/transfer.controller');

router.get('/transfers/admin', withAuthAdmin, isAdmin, getAllTransfers);
router.get('/transfers', withAuth, getAllTransfersByUser);
router.post('/transfers', withAuth, createTransfer);

module.exports = router;
