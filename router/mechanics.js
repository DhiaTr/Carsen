const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Mechanic, validateMechanic } = require('../models/mechanic');
const { Base } = require('../models/base');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/', auth, async (req, res) => {
    res.send(await Mechanic.find().populate('ID_Base'));
});

router.get('/:id', auth, async (req, res) => {

    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id.');

    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) return res.status(404).send('no mechanic with the given id was found.');

    res.send(await Mechanic.findById(req.params.id).populate('ID_Base'));

});

router.post('/', [auth, admin], async (req, res) => {

    const { error } = validateMechanic(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const base = await Base.findById(req.body.ID_Base);
    if (!base) return res.status(400).send('Invalid Base.');


    res.send();
});


module.exports = router;