const {
  client, testClient,
} = require('coingate-v2');
const db = require('../../config/db.config');

const Gateway = db.gateways;
const Setting = db.settings;

exports.coingatePayment = async (value, id, currency) => {
  try {
    const data = await Gateway.findOne({ where: { value: 'coingate' } });
    const appUrl = await Setting.findOne({ where: { value: 'appUrl' } });
    const apiUrl = await Setting.findOne({ where: { value: 'apiUrl' } });

    const coingate = client(data.apiKey);
    const testCongate = testClient(data.apiKey);

    const clientMain = data.ex1 === 'sandbox' ? testCongate : coingate;

    const payment = await clientMain.createOrder({
      order_id: id,
      price_amount: value.toFixed(2),
      price_currency: currency,
      receive_currency: currency,
      callback_url: `${apiUrl.param1}/payments/coingate`,
      success_url: `${appUrl.param1}/add-money?status=success`,
      cancel_url: `${appUrl.param1}/add-money?status=failed`,
    });
    return payment.payment_url;
  } catch (err) {
    return err;
  }
};
