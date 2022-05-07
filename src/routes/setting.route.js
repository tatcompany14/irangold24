const express = require('express');

const router = express.Router();
const multerInstance = require('../config/multer.config');

const { withAuth, isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');

const {
  updateFees, updateGateways, getSettingByValue, getSettings, getDashboard, updateSettingByValue,
  getLogs, updateRewards, updateGeneral, getGateways, getGatewaysAdmin, getGatewayByValueAdmin,
  updateAdjustments, getDashboardUser, getGatewayCurrencies, updateFooterMenu, updateMainMenu,
  getBasicInfo, updateLogoFav, handleImageUpload, sendUserEmail, updateRepeater, balanceManage,
} = require('../controllers/setting.controller');

router.get('/settings', getSettings);
router.get('/dashboard', withAuthAdmin, isAdmin, getDashboard);
router.get('/dashboard/me', withAuth, getDashboardUser);
router.get('/logs', withAuthAdmin, isAdmin, getLogs);
router.get('/settings/:value', getSettingByValue);
router.put('/settings/byvalue/:value', updateSettingByValue);
router.put('/settings/fee', withAuthAdmin, isAdmin, updateFees);
router.put('/settings/rewards', withAuthAdmin, isAdmin, updateRewards);
router.put('/settings/adjustments', withAuthAdmin, isAdmin, updateAdjustments);
router.put('/settings/general', withAuthAdmin, isAdmin, updateGeneral);
router.put('/payments/:value', updateGateways);
router.get('/gateways', getGateways);
router.get('/gateways/currencies', getGatewayCurrencies);
router.get('/gateways/admin', withAuthAdmin, isAdmin, getGatewaysAdmin);
router.get('/gateways/:value', withAuthAdmin, isAdmin, getGatewayByValueAdmin);
router.get('/info', getBasicInfo);
router.put('/menu/main', withAuthAdmin, isAdmin, updateMainMenu);
router.put('/menu/footer', withAuthAdmin, isAdmin, updateFooterMenu);
router.put('/repeater/:value', withAuthAdmin, isAdmin, updateRepeater);
router.put('/logo', withAuthAdmin, isAdmin,
  multerInstance.upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]), updateLogoFav);
router.post('/upload', withAuthAdmin, isAdmin, multerInstance.upload.single('image'), handleImageUpload);
router.post('/email', withAuthAdmin, isAdmin, sendUserEmail);
router.post('/balance', withAuthAdmin, isAdmin, balanceManage);

module.exports = router;
