const express = require('express');

const router = express.Router();

const { withAuth, isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  getAllExchangesByUser, getAllExchanges, getExchangeById, createExchange,
  getExchangeByIdAdmin, acceptExchange, declineExchange,
} = require('../controllers/exchange.controller');

router.get('/exchanges/admin', withAuthAdmin, isAdmin, getAllExchanges);
router.get('/exchanges', withAuth, getAllExchangesByUser);
router.get('/exchanges/:id', withAuth, getExchangeById);
router.get('/exchanges/:id/admin', withAuthAdmin, isAdmin, getExchangeByIdAdmin);
router.post('/exchanges', withAuth, createExchange);
router.put('/exchanges/:id/accept', withAuthAdmin, isAdmin, acceptExchange);
router.put('/exchanges/:id/decline', withAuthAdmin, isAdmin, declineExchange);

module.exports = router;
