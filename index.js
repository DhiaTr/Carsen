const express = require('express');
const app = express();
const helmet = require('helmet');
const compression = require('compression');
var cors = require('cors')

app.use(cors());
app.use(express.json());


require('./startup/db')();
require('./startup/config')();
require('./startup/routes')(app);



app.use(helmet());
app.use(compression());

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;