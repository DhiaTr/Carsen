const mongoose = require('mongoose');
const Joi = require('joi');

const schema = mongoose.Schema({
    B_Name: {
        type: String,
        minlength: 10,
        maxlength: 150,
        required: true
    },
    Region: {
        type: String,
        minlength: 5,
        maxlength: 100,
        required: true
    },
    city: {
        type: String,
        minlength: 5,
        maxlength: 100,
        required: true
    },
    address: {
        type: String,
        minlength: 20,
        maxlength: 255,
        required: true
    },
    phone: {
        type: String,
        minlength: 8,
        maxlength: 20,
        required: true
    }
});

const Base = mongoose.model('Base', schema);

function validateBase(Base) {
    const schema = {
        b_Name: Joi.string().min(10).max(150).required(),
        Region: Joi.string().min(5).max(100).required(),
        city: Joi.string().min(5).max(100).required(),
        address: Joi.string().min(20).max(255).required(),
        phone: Joi.string().min(8).max(20).required()
    }
    return Joi.validate(Base, schema);
}


module.exports.Base = Base;
module.exports.validateBase = validateBase;