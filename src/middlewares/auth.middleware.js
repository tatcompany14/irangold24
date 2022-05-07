const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');

const User = db.users;

exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ['HS256'],
});

exports.withAuth = (req, res, next) => {
  const { token } = req.cookies;
  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        message: 'توکن نامعتبر',
      });
    }
    req.user = user;
    return next();
  });
};

exports.withAuthAdmin = (req, res, next) => {
  const { adminToken } = req.cookies;
  jwt.verify(adminToken, process.env.SECRET, (err, user) => {
    if (err || !(user.role === 0)) {
      return res.status(401).json({
        message: 'توکن نامعتبر!',
      });
    }
    req.user = user;
    return next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role === 0) {
    return next();
  }
  return res.status(401).json({
    message: 'شما اجازه دسترسی ندارید!',
  });
};

exports.isMerchant = (req, res, next) => {
  if (req.user.role === 2) {
    return next();
  }
  return res.status(401).json({
    message: 'شما اجازه دسترسی ندارید!',
  });
};

exports.checkAuth = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.user.id,
    },
  });
  if (!user) {
    return res.status(401).json({
      message: 'توکن نامعتبر!',
    });
  }
  if (user.passUpdate && user.passUpdate > req.user.iat) {
    return res.status(401).json({
      message: 'توکن نامعتبر!',
    });
  }
  if (user) {
    const {
      id, name, email, phone, address, role,
    } = user;
    return res.status(200).json({
      login: true,
      isAdmin: role === 0,
      isMerchant: role === 2,
      user: {
        id,
        name,
        email,
        phone,
        address,
      },
    });
  }
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'none',
    secure: parseInt(process.env.COOKIESECURE, 10) === 1,
  });
  return res.status(401).json({
    message: 'توکن نامعتبر!',
  });
};

exports.checkAuthAdmin = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.user.id,
      role: 0,
    },
  });
  if (!user) {
    return res.status(401).json({
      message: 'توکن نامعتبر!',
    });
  }
  if (user.passUpdate && user.passUpdate > req.user.iat) {
    return res.status(401).json({
      message: 'توکن نامعتبر!',
    });
  }
  if (user) {
    const {
      id, name, email, phone, address, role,
    } = user;
    return res.status(200).json({
      login: true,
      isAdmin: role === 0,
      isMerchant: role === 2,
      user: {
        id,
        name,
        email,
        phone,
        address,
      },
    });
  }
  res.clearCookie('adminToken', {
    httpOnly: true,
    sameSite: 'none',
    secure: parseInt(process.env.COOKIESECURE, 10) === 1,
  });
  return res.status(401).json({
    message: 'توکن نامعتبر!',
  });
};
