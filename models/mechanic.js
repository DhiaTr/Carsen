const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = mongoose.Schema({
    ID_Base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Base'
    },
    FirstName: {
        type: String,
        minlength: 5,
        maxlength: 150,
        required: true
    },
    LastName: {
        type: String,
        minlength: 5,
        maxlength: 150,
        required: true
    },
    phone: {
        type: String,
        minlength: 8,
        maxlength: 12,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    hireDate: {
        type: Date,
        default: Date.now
    }
});

const Mechanic = mongoose.model('Mechanic', schema);

function validateMechanic(Mechanic) {
    const schema = {
        ID_Base: Joi.objectId(),
        FirstName: Joi.string().min(5).max(150).required(),
        LastName: Joi.string().min(5).max(150).required(),
        phone: Joi.string().min(8).max(12).required(),
        salary: Joi.number().required(),
        hireDate: Joi.date(),
    }
    return Joi.validate(Mechanic, schema);
}

module.exports.Mechanic = Mechanic;
module.exports.validateMechanic = validateMechanic;