const express = require('express');

const router = express.Router();
const { check } = require('express-validator');

const {
  signUp, signIn, signOut, forgotPassword, resetInit, activateAccount, signInAdmin, signOutAdmin,
} = require('../controllers/auth.controller');

const {
  withAuth, withAuthAdmin, checkAuth, checkAuthAdmin,
} = require('../middlewares/auth.middleware');

// Authentication
router.post(
  '/signup',
  [
    check('name', 'نام باید بیشتر از سه کاراکتر باشد').isLength({ min: 3 }),
    check('email', 'ایمیل اجباری می باشد').isEmail(),
    check('password', 'پسورد حداقل باید 8 کاراکتر باشد').isLength({ min: 8 }),
  ],
  signUp,
);

router.post(
  '/signin',
  [
    check('email', 'ایمیل را وارد کنید').isEmail(),
    check('password', 'پسورد را وارد کنید').isLength({ min: 8 }),
  ],
  signIn,
);

router.post(
  '/signin/admin',
  [
    check('email', 'ایمیل را وارد کنید').isEmail(),
    check('password', 'پسورد را وارد کنید').isLength({ min: 8 }),
  ],
  signInAdmin,
);

router.post(
  '/forgot',
  [
    check('email', 'ایمیل را وارد کنید').isEmail(),
  ],
  forgotPassword,
);

router.post(
  '/reset',
  [
    check('password', 'پسورد باید حداقل 8 کاراکتر باشد').isLength({ min: 8 }),
  ],
  resetInit,
);

router.post('/activate', activateAccount);

router.get('/checkauth', withAuth, checkAuth);
router.get('/checkauth/admin', withAuthAdmin, checkAuthAdmin);
router.get('/signout', signOut);
router.get('/signout/admin', signOutAdmin);

module.exports = router;
