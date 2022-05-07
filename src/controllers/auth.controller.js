const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const { customAlphabet } = require('nanoid');
const db = require('../config/db.config');
const mailer = require('../utils/mailer');

const User = db.users;
const Merchant = db.merchants;
const Setting = db.settings;
const Log = db.logs;

exports.signUp = async (req, res) => {
  // Validating the form
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      params: errors.array()[0].param,
    });
  }

  // Checking if the user trying to register already exists
  if (
    await User.findOne({
      where: {
        email: req.body.email,
      },
    })
  ) {
    return res.status(400).json({
      message: 'این ایمیل قبلا ثبت شده است',
    });
  }

  const random = uuid.v4();

  const user = {
    name: req.body.name,
    email: req.body.email,
    refferedBy: req.body.refferedBy,
    password: req.body.password,
    active: false,
    reset: random,
    role: req.body.merchant ? 2 : 1,
  };

  try {
    const data = await User.create(user);
    const site = await Setting.findOne({ where: { value: 'site' } });
    const appUrl = await Setting.findOne({ where: { value: 'appUrl' } });

    if (req.body.merchant) {
      const nanoId = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
      const merId = nanoId();
      Merchant.create({
        merId,
        name: req.body.merchantName,
        email: req.body.merchantEmail,
        address: req.body.merchantAddress,
        proof: req.body.merchantProof,
        userId: data.id,
      });
    }

    const mailOptions = {
      user: data.id,
      subject: ` به  ${site.param1} خوش آمدید `,
      message: `<h3>Welcome to ${site.param1}</h3><br/><p>Activate your account: <a href="${appUrl.param1}/activate/${random}">${appUrl.param1}/activate/${random}</a></p>`,
    };

    mailer(mailOptions);
    await Log.create({ message: `New User #${data.id} with ${data.email} signed up` });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

exports.activateAccount = async (req, res) => {
  if (!(req.body.code)) {
    return res.status(400).json({
      message: 'وارد کردن کد الزامی است',
    });
  }

  const data = await User.findOne({ where: { reset: req.body.code } });

  if (!data) {
    return res.status(404).json({
      message: 'کد نامعتبر می باشد',
    });
  }

  try {
    await User.update(
      { active: true, reset: null },
      { where: { id: data.id } },
    );
    return res.json({ message: 'حساب شما فعال شد' });
  } catch (err) {
    return res.status(500).json({ message: 'خطای سیستمی' });
  }
};

exports.signUpAdmin = async (req, res) => {
  // Validating the form
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      params: errors.array()[0].param,
    });
  }

  // Checking if the user trying to register already exists
  if (
    await User.findOne({
      where: {
        email: req.body.email,
      },
    })
  ) {
    return res.status(400).json({
      message: 'این ایمیل قبلا ثبت شده است',
    });
  }

  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: 0,
    active: true,
  };

  try {
    const data = await User.create(user);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

exports.signIn = async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email || null,
      active: true,
    },
    include: ['merchant'],
  });

  if (!user) {
    return res.status(401).json({
      message: 'اطلاعات ورود نامعتبر است!',
    });
  }

  if (user.role === 2 && !(user.merchant)) {
    return res.status(403).json({
      message: 'خطای توکن، با پشتیبانی تماس بگیرید',
    });
  }

  if (user.role === 2 && !(user.merchant.status === 'verified')) {
    return res.status(403).json({
      message: 'توکن نامعتبر می باشد',
    });
  }

  const matchPassword = await bcrypt.compare(req.body.password, user.password);

  if (!matchPassword) {
    return res.status(401).json({
      message: 'اطلاعات ورود نامعتبر می باشد',
    });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.SECRET, {
    expiresIn: '30d',
  });

  res.cookie('token', token, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.SAMESITE,
    secure: parseInt(process.env.COOKIESECURE, 10) === 1,
  });

  const {
    id, name, email, phone, address, role,
  } = user;

  return res.json({
    user: {
      id,
      name,
      email,
      phone,
      address,
      role,
    },
  });
};

exports.signInAdmin = async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email,
      role: 0,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: 'اطلاعات ورود نامعتبر می باشد',
    });
  }

  const matchPassword = await bcrypt.compare(req.body.password, user.password);

  if (!matchPassword) {
    return res.status(401).json({
      message: 'اطلاعات ورود نامعتبر می باشد',
    });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.SECRET, {
    expiresIn: '30d',
  });

  res.cookie('adminToken', token, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.SAMESITE,
    secure: parseInt(process.env.COOKIESECURE, 10) === 1,
  });

  const {
    id, name, email, phone, address, role,
  } = user;

  return res.json({
    user: {
      id,
      name,
      email,
      phone,
      address,
      role,
    },
  });
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  const appUrl = await Setting.findOne({ where: { value: 'appUrl' } });

  if (!user) {
    return res.status(404).json({
      message: 'ایمیل خود را وارد کنید',
    });
  }

  const randomId = uuid.v4();

  if (user.reset) {
    await User.update({ reset: null }, { where: { email: req.body.email } });
  }
  await User.update({ reset: randomId }, { where: { email: req.body.email } });

  const mailOptions = {
    user: user.id,
    subject: 'ریست پسورد',
    html: `<p>Link to reset your password: <a href="${appUrl.param1}/reset/${randomId}">${appUrl.param1}/reset/${randomId}</a></p>`,
  };

  mailer(mailOptions);

  return res.json({
    message: 'یک لینک برای بازنشانی پسورد به ایمیل شما ارسال شد',
  });
};

exports.resetInit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      params: errors.array()[0].param,
    });
  }
  if (!(req.body.code && req.body.password)) {
    return res.status(400).json({
      message: 'ورود کد الزامی است',
    });
  }

  const data = await User.findOne({ where: { reset: req.body.code } });

  if (!data) {
    return res.status(404).json({
      message: 'کد نامعتبر می باشد',
    });
  }

  try {
    await User.update(
      { password: req.body.password, reset: null },
      { where: { id: data.id } },
    );
    return res.json({ message: 'پسورد با موفقیت بروزرسانی شد' });
  } catch (err) {
    return res.status(500).json({ message: 'خطای سیستمی با پشتیبانی تماس بگیرید' });
  }
};

exports.signOut = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.SAMESITE,
    secure: parseInt(process.env.COOKIESECURE, 10) === 1,
  });
  res.json({
    message: 'خروج با موفقیت انجام شد',
  });
};

exports.signOutAdmin = (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    sameSite: process.env.SAMESITE,
    secure: parseInt(process.env.COOKIESECURE, 10) === 1,
  });
  res.json({
    message: 'خروج با موفقیت انجام شد',
  });
};
