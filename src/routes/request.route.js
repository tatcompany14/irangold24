const express = require('express');

const router = express.Router();

const {
  withAuth, isAdmin, isMerchant, withAuthAdmin,
} = require('../middlewares/auth.middleware');

const {
  getAllRequests, getAllRequestsByMerchant, createRequest, getRequestById,
  getRequestByTrxId, deleteRequest,
} = require('../controllers/request.controller');

router.get('/requests/admin', withAuthAdmin, isAdmin, getAllRequests);
router.get('/requests', withAuth, isMerchant, getAllRequestsByMerchant);
router.get('/requests/:id', withAuth, isMerchant, getRequestById);
router.get('/requests/trx/:trxId', withAuth, getRequestByTrxId);
router.post('/requests', withAuth, isMerchant, createRequest);
router.delete('/requests/:id', withAuthAdmin, isAdmin, deleteRequest);

module.exports = router;
