const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Base, validateBase } = require('../models/base');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/', auth, async (req, res) => {
    return res.send(await Base.find());
});

router.get('/:id', auth, async (req, res) => {

    const idStatus = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idStatus) return res.status(400).send('invalid id');

    const base = await Base.findById(req.params.id);
    if (!base) return res.status(404).send('base not found');

    return res.send(await Base.findById(req.params.id));
});

router.post('/', async (req, res) => {

    const { error } = validateBase(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    console.log('here!');

    const base = new Base({
        B_Name: req.body.B_Name,
        Region: req.body.Region,
        city: req.body.city,
        adress: req.body.adress,
        phone: req.body.phone
    });
    res.send(await base.save());
});


router.put('/:id', [auth, admin], async (req, res) => {

    let result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id given');

    const { error } = validateBase(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let base = await Base.findById(req.params.id);
    if (!base) return res.status(404).send('base not found!');

    base = await Base.findByIdAndUpdate(req.params.id, {
        B_Name: req.body.B_Name,
        Region: req.body.Region,
        city: req.body.city,
        adress: req.body.adress,
        phone: req.body.phone
    }, {
        new: true
    })

    res.send(base);

});


router.delete('/:id', [auth, admin], async (req, res) => {

    let result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id given');

    let base = await Base.findById(req.params.id);
    if (!base) return res.status(404).send('base not found!');

    result = await Base.findByIdAndRemove(req.params.id);
    res.send(result);
});

module.exports = router;