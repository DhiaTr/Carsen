const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
Joi.objectId = require('joi-objectid')(Joi);

const schema = mongoose.Schema({
    ID_Base: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Base'
    },
    FirstName: {
        type: String,
        minlength: 10,
        maxlength: 150,
        required: true
    },
    LastName: {
        type: String,
        minlength: 10,
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
    },
    password: {
        type: String,
        minlength: 5,
        maxlength: 1024,
        required: true
    },
    isAdmin: Boolean
});

schema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
}

const Agent = mongoose.model('Agent', schema);

function validateAgent(Agent) {
    const schema = {
        ID_Base: Joi.objectId(),
        FirstName: Joi.string().min(10).max(150).required(),
        LastName: Joi.string().min(10).max(150).required(),
        phone: Joi.string().min(8).max(12).required(),
        salary: Joi.number().required(),
        hireDate: Joi.date(),
        password: Joi.string().min(5).max(1024).required()
    }
    return Joi.validate(client, schema);
}

module.exports.Agent = Agent;
module.exports.validateAgent = validateAgent;