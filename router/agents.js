const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const { Agent } = require('../models/agent');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');


router.get('/', auth, async (req, res) => {
    res.send(await Agent.find());
});

router.get('/:id', auth, async (req, res) => {

    let result = mongoose.Types.ObjectId.isValid(req.params.id);
    if(!result) return res.status(400).send('Invalid id provided.');

    result = await Agent.findById(req.params.id);
    if(!result) return res.status(404).send('no agent with the given id was found.');

    res.send(await Agent.findById(req.params.id));
});

module.exports = router;