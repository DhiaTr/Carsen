const express = require('express');
const router = express.Router();

const { Agent } = require('../models/agent');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');


router.get('/', auth, async (req, res) => {
    res.send();
});

module.exports = router;