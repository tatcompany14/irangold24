const rp = require('request-promise');
const db = require('../../config/db.config');

const Gateway = db.gateways;
const Setting = db.settings;

exports.voguePayment = async (data, user) => {
  try {
    const gateway = await Gateway.findOne({ where: { value: 'voguepay' } });
    const apiUrl = await Setting.findOne({ where: { value: 'apiUrl' } });
    const appUrl = await Setting.findOne({ where: { value: 'appUrl' } });

    const obj = {
      p: 'linkToken',
      v_merchant_id: gateway.ex1,
      memo: 'Deposit Request',
      total: data.amount,
      email: user.email,
      merchant_ref: data.id,
      cur: data.currency,
      notify_url: `${apiUrl.param1}/payments/voguepay`,
      success_url: `${appUrl.param1}/add-money?status=success`,
      fail_url: `${appUrl.param1}/add-money?status=failed`,
    };

    const qs = new URLSearchParams(obj);

    const apiData = await rp({
      method: 'POST',
      uri: `https://pay.voguepay.com?${qs}`,
      json: true,
    });

    return apiData;
  } catch (err) {
    return err;
  }
};
