const express = require('express');
const router = express.Router();
const { Car } = require('../models/car');

const auth = require('../middlewares/auth');


router.get('/', auth, async (req, res) => {
    res.send(await Car.find());
});











module.exports = router;