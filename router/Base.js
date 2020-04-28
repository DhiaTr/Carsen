const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Base, validateBase } = require('../models/base');
const auth = require('../middlewares/auth');
//should return 200 if request valid



router.get('/', auth, async (req, res) => {
    return res.send(await Base.find());
});

router.get('/:id', auth, async (req, res) => {

    const idStatus = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!idStatus) return res.status(400).send('invalid id');

    const base = await Base.findById(req.params.id);
    if (!base) return res.status(404).send('base not found');



    return res.send(await Base.find());
});


// router.post('/', async (req, res) => {
//     const base = new Base({
//         B_Name: req.body.B_Name,
//         Region: req.body.Region,
//         city: req.body.city,
//         adress: req.body.adress,
//         phone: req.body.phone
//     });
//     res.send(await base.save());
// });

module.exports = router;