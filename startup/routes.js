const Base = require('../router/Base');
const agents = require('../router/agents');
const cars = require('../router/car');
const mechanics = require('../router/mechanics');
const repairs = require('../router/repair');
const clients = require('../router/client');
const archived_orders = require('../router/archived_order');
const orders = require('../router/order');
const auth = require('../router/auth');

module.exports = function (app) {
    app.use('/api/cars', cars);
    app.use('/api/base', Base);
    app.use('/api/mechanics', mechanics);
    app.use('/api/agents', agents);
    app.use('/api/repairs', repairs);
    app.use('/api/clients', clients);
    app.use('/api/archived_orders', archived_orders);
    app.use('/api/orders', orders);
    app.use('/api/auth', auth);
}