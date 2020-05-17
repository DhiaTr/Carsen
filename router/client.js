const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const { Client, validateClient } = require('../models/client');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/', auth, async (req, res) => {
    res.send(await Client.find());
});

router.get('/:id', auth, async (req, res) => {

    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id.');

    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).send('no client with the given id was found.');

    res.send(client);
});

router.post('/', auth, async (req, res) => {

    const { error } = validateClient(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let client = await Client.findOne({ phone: req.body.phone });
    if (client) return res.status(400).send('client already existant.');

    client = new Client({
        CIN: req.body.CIN,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        phone: req.body.phone,
        address: req.body.address
    });
    await client.save();

    res.send(client);
});

router.put('/:id', auth, async (req, res) => {
    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id.');

    let client = await Client.findById(req.params.id);
    if (!client) return res.status(404).send('no client with the given id was found.');

    const { error } = validateClient(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    client = await Client.findByIdAndUpdate(req.params.id, {
        CIN: req.body.CIN,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        phone: req.body.phone,
        address: req.body.address
    }, {
        new: true
    });

    res.send(client);
});

router.delete('/:id', [auth, admin], async (req, res) => {

    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id.');

    let client = await Client.findById(req.params.id);
    if (!client) return res.status(404).send('no client with the given id was found.');

});



module.exports = router;