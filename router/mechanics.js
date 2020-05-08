const express = require('express');
const router = express.Router();
const { Mechanic } = require('../models/mechanic');

const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
    res.send(await Mechanic.find());
});


module.exports = router;