const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const { Order, validateOrder } = require('../models/order');
const { Client } = require('../models/client');
const { Car } = require('../models/car');
const { ArchivedOrder } = require('../models/archived_order');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/', auth, async (req, res) => {
    res.send(await Order.find().populate('ID_Car').populate('ID_Client'));
});

router.get('/:id', auth, async (req, res) => {

    const idStatus = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idStatus) return res.status(400).send('invalid id.');

    const order = await Order.findById(req.params.id).populate('ID_Car').populate('ID_Client');
    if (!order) return res.status(404).send('no order with the given id was found.');

    res.send(order);
});

router.post('/', auth, async (req, res) => {

    const { error } = validateOrder(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const client = await Client.findById(req.body.ID_Client);
    if (!client) return res.status(400).send('no client with the given id was found.');

    const car = await Car.findById(req.body.ID_Car);
    if (!car) return res.status(400).send('no car with the given id was found');

    let order = await Order.find({
        Rent_Start_Date: { $gte: req.body.Rent_Start_Date },
        Rent_End_Date: { $lte: req.body.Rent_End_Date }
    });
    if (order.length > 0) return res.status(400).send('car already in rent.');

    order = new Order({
        ID_Client: req.body.ID_Client,
        ID_Car: req.body.ID_Car,
        Rent_Start_Date: req.body.Rent_Start_Date,
        Rent_End_Date: req.body.Rent_End_Date
    });
    await order.save();
    res.send(order);
});

router.put('/:id', auth, async (req, res) => {

    const idStatus = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idStatus) return res.status(400).send('invalid id.');

    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send('no order with the given id was found.');

    const { error } = validateOrder(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const client = await Client.findById(req.body.ID_Client);
    if (!client) return res.status(400).send('no client with the given id was found.');

    const car = await Car.findById(req.body.ID_Car);
    if (!car) return res.status(400).send('no car with the given id was found');

    order = await Order.findByIdAndUpdate(req.params.id, {
        ID_Client: req.body.ID_Client,
        ID_Car: req.body.ID_Car,
        Rent_Start_Date: req.body.Rent_Start_Date,
        Rent_End_Date: req.body.Rent_End_Date
    }, {
        new: true
    });
    res.send(order);
});

router.delete('/:id', [auth, admin], async (req, res) => {

    const idStatus = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idStatus) return res.status(400).send('invalid id.');

    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send('no order with the given id was found.');

    const archivedOrder = new ArchivedOrder({
        ID_Client: order.ID_Client,
        ID_Car: order.ID_Car,
        Order_Date: order.Order_Date,
        Rent_Start_Date: order.Rent_Start_Date,
        Rent_End_Date: order.Rent_End_Date
    });
    await archivedOrder.save();
    order = await Order.findByIdAndDelete(req.params.id);

    res.send(order);

});


module.exports = router;