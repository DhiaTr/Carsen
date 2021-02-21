const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

const { ArchivedOrder } = require('../models/archived_order');

router.get('/', [auth, admin], async (req, res) => {
    res.send(await ArchivedOrder.find().populate('ID_Car').populate('ID_Client'));
});

router.get('/:id', [auth, admin], async (req, res) => {

    const idStatus = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idStatus) return res.status(400).send('invalid id');

    const archived_order = await ArchivedOrder.findById(req.params.id).populate('ID_Car').populate('ID_Client');
    if (!archived_order) return res.status(404).send('archived order not found');

    res.send(archived_order);

});

module.exports = router;