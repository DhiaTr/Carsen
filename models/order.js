const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = mongoose.Schema({
    ID_Client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    ID_Car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    },
    Order_Date: {
        type: Date,
        default: Date.now
    },
    Rent_Start_Date: {
        type: Date,
        required: true
    },
    Rent_End_Date: {
        type: Date,
        required: true
    }
});

const Order = mongoose.model('Order', schema);

function validateOrder(Order) {
    const schema = {
        ID_Client: Joi.objectId(),
        ID_Car: Joi.objectId(),
        Order_Date: Joi.date(),
        Rent_Start_Date: Joi.date().required(),
        Rent_End_Date: Joi.date().required()
    }
    return Joi.validate(Order, schema);
}

module.exports.Order = Order;
module.exports.validateOrder = validateOrder;