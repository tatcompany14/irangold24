const express = require('express');

const router = express.Router();

const { withAuth, isAdmin, withAuthAdmin } = require('../middlewares/auth.middleware');
const {
  getAllUsers, countUsers, updateUser, updateUserAdmin, deleteUser, getUserDetails,
  getUserById,
} = require('../controllers/user.controller');

router.get('/users/count', withAuthAdmin, isAdmin, countUsers);
router.get('/users', withAuthAdmin, isAdmin, getAllUsers);
router.get('/users/me', withAuth, getUserDetails);
router.get('/users/me/admin', withAuthAdmin, isAdmin, getUserDetails);
router.get('/users/:id', withAuthAdmin, isAdmin, getUserById);
router.put('/users/me', withAuth, updateUser);
router.put('/users/:id', withAuthAdmin, isAdmin, updateUserAdmin);
router.delete('/users/:id', withAuthAdmin, isAdmin, deleteUser);

module.exports = router;
