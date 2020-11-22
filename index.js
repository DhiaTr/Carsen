const express = require('express');
const app = express();
const Base = require('./router/Base');
const agents = require('./router/agents');
const cars = require('./router/car');
const mechanics = require('./router/mechanics');
const repairs = require('./router/repair');
const clients = require('./router/client');
const archived_orders = require('./router/archived_order');
const orders = require('./router/order');
const auth = require('./router/auth');
const helmet = require('helmet');
const compression = require('compression');
var cors = require('cors')

app.use(cors());
app.use(express.json());


require('./startup/db')();
require('./startup/config')();

app.use('/api/cars', cars);
app.use('/api/base', Base);
app.use('/api/mechanics', mechanics);
app.use('/api/agents', agents);
app.use('/api/repairs', repairs);
app.use('/api/clients', clients);
app.use('/api/archived_orders', archived_orders);
app.use('/api/orders', orders);
app.use('/api/auth', auth);

app.use(helmet());
app.use(compression());

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;