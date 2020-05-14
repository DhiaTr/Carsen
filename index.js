const express = require('express');
const app = express();
const Base = require('./router/Base');
const agents = require('./router/agents');
const cars = require('./router/car');
const mechanics = require('./router/mechanics');
const repairs = require('./router/repair');

app.use(express.json());

require('./startup/db')();
require('./startup/config')();
app.use('/api/cars', cars);
app.use('/api/base', Base);
app.use('/api/mechanics', mechanics);
app.use('/api/agents', agents);
app.use('/api/repairs', repairs);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;