const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const { Order, validateOrder } = require('../models/order');
const { Client } = require('../models/client');
const { Car } = require('../models/car');

const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
    res.send(await Order.find());
});

router.get('/:id', auth, async (req, res) => {

    const idStatus = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idStatus) return res.status(400).send('invalid id.');

    const order = await Order.findById(req.params.id);
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
        Order_Date: req.body.Order_Date,
        Rent_Start_Date: req.body.Rent_Start_Date,
        Rent_End_Date: req.body.Rent_End_Date
    });
    await order.save();
    res.send(order);
});

router.put('/:id', auth, async (req, res) => {

    const idStatus = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idStatus) return res.status(400).send('invalid id.');

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send('no order with the given id was found.');
});

module.exports = router;