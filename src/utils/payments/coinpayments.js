const Coinpayments = require('coinpayments');
const db = require('../../config/db.config');

const Gateway = db.gateways;
const Setting = db.settings;

exports.coinPayments = async (data, user) => {
  try {
    const gateway = await Gateway.findOne({ where: { value: 'coinpayments' } });
    const appUrl = await Setting.findOne({ where: { value: 'appUrl' } });
    const apiUrl = await Setting.findOne({ where: { value: 'apiUrl' } });

    const client = new Coinpayments({
      key: gateway.apiKey,
      secret: gateway.secretKey,
    });

    const payment = await client.createTransaction({
      currency1: data.symbol,
      currency2: data.symbol,
      amount: data.amount,
      buyer_email: user.email,
      invoice: data.id,
      custom: 'deposit',
      ipn_url: `${apiUrl.param1}/payments/coinpayments`,
      success_url: `${appUrl.param1}/add-money?status=success`,
      cancel_url: `${appUrl.param1}/add-money?status=failed`,
    });
    return payment;
  } catch (err) {
    return err;
  }
};
