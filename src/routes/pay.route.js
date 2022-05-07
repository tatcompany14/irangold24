const express = require('express');

const router = express.Router();

const {
  withAuth, isAdmin, withAuthAdmin,
} = require('../middlewares/auth.middleware');

const {
  getAllPaysByUser, getAllPays, getPaysByTrxId, createPays, deletePays, createPaysByTrx,
} = require('../controllers/pay.controller');

router.get('/pays/admin', withAuthAdmin, isAdmin, getAllPays);
router.get('/pays', withAuth, getAllPaysByUser);
router.get('/pays/trx/:trxId', withAuth, getPaysByTrxId);
router.post('/pays', withAuth, createPays);
router.post('/pays/trx', withAuth, createPaysByTrx);
router.delete('/pays/:id', withAuthAdmin, isAdmin, deletePays);

module.exports = router;
