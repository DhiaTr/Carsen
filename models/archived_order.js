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
        required: true
    },
    Rent_Start_Date: {
        type: Date,
        required: true
    },
    Rent_End_Date: {
        type: Date,
        required: true
    },
    Delete_Date: {
        type: Date,
        default: Date.now
    }
});

const Archived_Order = mongoose.model('Archived_Order', schema);

function validateArchivedOrder(ArchivedOrder) {
    const schema = {
        ID_Client: Joi.objectId(),
        ID_Car: Joi.objectId(),
        Order_Date: Joi.date().required(),
        Rent_Start_Date: Joi.date().required(),
        Rent_End_Date: Joi.date().required(),
        Delete_Date: Joi.date()
    }
    return Joi.validate(ArchivedOrder, schema);
}

module.exports.ArchivedOrder = Archived_Order;
module.exports.validateArchivedOrder = validateArchivedOrder;