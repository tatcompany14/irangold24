const coinbase = require('coinbase-commerce-node');
const db = require('../../config/db.config');

const Gateway = db.gateways;
const Setting = db.settings;

exports.coinbasePayment = async (value, id, currency) => {
  try {
    const data = await Gateway.findOne({ where: { value: 'coinbase' } });
    const appUrl = await Setting.findOne({ where: { value: 'appUrl' } });
    const { Client } = coinbase;
    Client.init(data.apiKey);
    const { Charge } = coinbase.resources;

    const payment = await Charge.create({
      name: `Deposit #${id}`,
      description: 'Deposit Request to Wallet',
      pricing_type: 'fixed_price',
      metadata: { id },
      local_price: {
        amount: value.toFixed(2),
        currency,
      },
      redirect_url: `${appUrl.param1}/add-money?status=success`,
      cancel_url: `${appUrl.param1}/add-money?status=failed`,
    });
    return payment;
  } catch (err) {
    return err;
  }
};
