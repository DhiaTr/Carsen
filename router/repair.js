const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const { Repair, validateRepair } = require('../models/repair');
const { Mechanic } = require('../models/mechanic');
const { Car } = require('../models/car');

const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');

router.get('/', auth, async (req, res) => {
    res.send(await Repair.find().populate('ID_Mechanic').populate('ID_Car'));
});

router.get('/:id', auth, async (req, res) => {

    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id.');

    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).send('repair not found.');

    res.send(await Repair.findById(req.params.id).populate('ID_Mechanic').populate('ID_Car'));
});

router.post('/', auth, async (req, res) => {
    const { error } = validateRepair(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const mechanic = await Mechanic.findById(req.body.ID_Mechanic);
    if (!mechanic) return res.status(400).send('invalid mechanic id.');

    const car = await Car.findById(req.body.ID_Car);
    if (!car) return res.status(400).send('invalid car id.');

    const repair = new Repair({
        ID_Mechanic: req.body.ID_Mechanic,
        ID_Car: req.body.ID_Car,
        Repair_Date: req.body.Repair_Date,
        costs: req.body.costs
    });

    res.send(await repair.save());
});

router.put('/:id', auth, async (req, res) => {

    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id.');

    let repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).send('repair not found.');

    const { error } = validateRepair(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const mechanic = await Mechanic.findById(req.body.ID_Mechanic);
    if (!mechanic) return res.status(400).send('invalid mechanic id.');

    const car = await Car.findById(req.body.ID_Car);
    if (!car) return res.status(400).send('invalid car id.');

    repair = await Repair.findByIdAndUpdate(req.params.id,
        {
            ID_Mechanic: req.body.ID_Mechanic,
            ID_Car: req.body.ID_Car,
            Repair_Date: req.body.Repair_Date,
            costs: req.body.costs
        }, {
        new: true
    });

    res.send(repair);

});

router.delete('/:id', [auth, admin], async (req, res) => {

    const result = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!result) return res.status(400).send('invalid id.');

    let repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).send('repair not found.');

    repair = await Repair.findByIdAndRemove(req.params.id);

    res.send(repair);

});

module.exports = router;