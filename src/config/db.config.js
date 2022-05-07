const config = {
  HOST: process.env.MYSQL_HOST_IP,
  USER: process.env.MYSQL_USER,
  PASSWORD: process.env.MYSQL_PASSWORD,
  DB: process.env.MYSQL_DATABASE,
  dialect: process.env.DIALECT || 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: 0,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};
db.Sequelize = Sequelize;

db.users = require('../models/user.model')(sequelize);
db.withdraws = require('../models/withdraw.model')(sequelize);
db.deposits = require('../models/deposit.model')(sequelize);
db.settings = require('../models/setting.model')(sequelize);
db.gateways = require('../models/gateway.model')(sequelize);
db.logs = require('../models/log.model')(sequelize);
db.transfers = require('../models/transfer.model')(sequelize);
db.currencies = require('../models/currency.model')(sequelize);
db.exchanges = require('../models/exchange.model')(sequelize);
db.wallets = require('../models/wallet.model')(sequelize);
db.kycs = require('../models/kyc.model')(sequelize);
db.methods = require('../models/method.model')(sequelize);
db.linkeds = require('../models/linked.model')(sequelize);
db.merchants = require('../models/merchant.model')(sequelize);
db.requests = require('../models/request.model')(sequelize);
db.pays = require('../models/pay.model')(sequelize);
db.pages = require('../models/page.model')(sequelize);

// Withdraw Relation
db.users.hasMany(db.withdraws, { as: 'withdraws' });
db.withdraws.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
// Deposit Relation
db.users.hasMany(db.deposits, { as: 'deposits' });
db.deposits.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
// Transfer Relation
db.users.hasMany(db.transfers, { as: 'transfers' });
db.transfers.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
// Exchange Relations
db.users.hasMany(db.exchanges, { as: 'exchanges' });
db.exchanges.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
// Wallet Relation
db.users.hasMany(db.wallets, { as: 'wallets' });
db.wallets.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
// KYC Relation
db.users.hasMany(db.kycs, { as: 'kycs' });
db.kycs.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
// Linked Account Relation
db.users.hasMany(db.linkeds, { as: 'linkeds' });
db.linkeds.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
db.linkeds.belongsTo(db.methods, {
  foreignKey: 'methodId',
  as: 'method',
});
// Merchant Relation
db.users.hasOne(db.merchants, { as: 'merchant', foreignKey: 'userId' });
db.merchants.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});
// Request Relation
db.merchants.hasMany(db.requests, { as: 'requests' });
db.requests.belongsTo(db.merchants, {
  foreignKey: 'merchantId',
  as: 'merchant',
});
// Pays Relation
db.users.hasMany(db.pays, { as: 'pays' });
db.pays.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});

db.sequelize = sequelize;

module.exports = db;
