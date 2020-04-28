const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = mongoose.Schema({
    ID_Base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Base'
    },
    Mark: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    Model: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    Registration_Number: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    production_Year: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 4
    },
    Rent_Price: {
        type: Number,
        required: true
    },
    Category: {
        type: String,
        minlength: 5,
        maxlength: 30,
        required: true
    }
});

const Car = mongoose.model('Car', schema);

function validateCar(car) {
    const schema = {
        _id: Joi.string().required(),
        ID_Base: Joi.objectId(),
        Mark: Joi.string().min(5).max(100).required(),
        Model: Joi.string().min(5).max(100).required(),
        Registration_Number: Joi.string().min(3).max(30).required(),
        production_Year: Joi.string().min(4).max(4).required(),
        Rent_Price: Joi.number().required(),
        Category: Joi.String().min(5).max(30).required()
    }
    return Joi.validate(car, schema);
}


module.exports.validateCar = validateCar;
module.exports.Car = Car;