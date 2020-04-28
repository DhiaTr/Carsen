const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = mongoose.Schema({
    ID_Mechanic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mechanic'
    },
    ID_Car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    },
    Repair_Date: {
        type: Date,
        required: true
    },
    costs: {
        type: Number,
        min: 0,
        required: true
    }
});

const Repair = mongoose.model('Repair', schema);

function validateRepair(Repair) {
    const schema = {
        ID_Mechanic: Joi.objectId(),
        ID_Car: Joi.objectId(),
        Repair_Date: Joi.date().required(),
        costs: Joi.number().required()
    }
    return Joi.validate(Repair, schema);
}

module.exports.Repair = Repair;
module.exports.validateRepair = validateRepair;