const express = require('express');
const app = express();
const Base = require('./router/Base');
const agents = require('./router/agents');

app.use(express.json());

require('./startup/db')();
require('./startup/config')();
app.use('/api/base', Base);
app.use('/api/agents', agents);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;