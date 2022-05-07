const express = require('express');

const router = express.Router();
const multerInstance = require('../config/multer.config');

const { isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  getAllCurrencies, createCurrency, getCurrencyById, updateCurrency,
  deleteCurrency, fetchCurrencyRates, getCurrencyList,
} = require('../controllers/currency.controller');

router.get('/currencies', getAllCurrencies);
router.get('/currencies/list', getCurrencyList);
router.get('/currencies/:id', getCurrencyById);
router.post('/fetchrates', withAuthAdmin, isAdmin, fetchCurrencyRates);
router.post('/currencies', withAuthAdmin, isAdmin, multerInstance.upload.single('icon'), createCurrency);
router.put('/currencies/:id', withAuthAdmin, isAdmin, multerInstance.upload.single('icon'), updateCurrency);
router.delete('/currencies/:id', withAuthAdmin, isAdmin, deleteCurrency);

module.exports = router;
