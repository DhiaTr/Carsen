const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { Car, validateCar } = require('../models/car');
const { Base } = require('../models/base');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');


router.get('/', auth, async (req, res) => {
    res.send(await Car.find().populate('ID_Base'));
});

router.get('/:id', auth, async (req, res) => {

    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('Invalid id provided.');

    const car = await Car.findById(req.params.id).populate('ID_Base');
    if (!car) return res.status(404).send('no car with the given id was found');

    res.send(car);
});

router.post('/', [auth, admin], async (req, res) => {

    let { error } = validateCar(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const base = await Base.findById(req.body.ID_Base);
    if (!base) return res.status(400).send('invalid base id.');

    const car = new Car({
        ID_Base: req.body.ID_Base,
        Mark: req.body.Mark,
        Model: req.body.Model,
        Registration_Number: req.body.Registration_Number,
        production_Year: req.body.production_Year,
        Rent_Price: req.body.Rent_Price,
        Category: req.body.Category
    });
    await car.save();
    res.send(car);
});

router.put('/:id', [auth, admin], async (req, res) => {

    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('Invalid id provided.');

    let car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send('no car with the given id was found.');

    const { error } = validateCar(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    car = await Car.findByIdAndUpdate(req.params.id, {
        ID_Base: req.body.ID_Base,
        Mark: req.body.Mark,
        Model: req.body.Model,
        Registration_Number: req.body.Registration_Number,
        production_Year: req.body.production_Year,
        Rent_Price: req.body.Rent_Price,
        Category: req.body.Category
    }, {
        new: true
    });
    await car.save();
    res.send(car);

});

router.delete('/:id', [auth, admin], async (req, res) => {

    let result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('Invalid id provided.');

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send('no car with the given id was found.');

    result = await Car.findByIdAndDelete(req.params.id);
    res.send(result);

});

module.exports = router;