const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

const schema = mongoose.Schema({
    CIN: {
        type: String,
        minlength: 8,
        maxlength: 8,
        required: true
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
    address: {
        type: String,
        minlength: 30,
        maxlength: 150,
        required: true
    }
});

const Client = mongoose.model('Client', schema);

function validateClient(client) {
    const schema = {
        CIN: Joi.string().min(8).max(8).required(),
        FirstName: Joi.string().min(10).max(150).required(),
        LastName: Joi.string().min(10).max(150).required(),
        phone: Joi.string().min(8).max(12).required(),
        address: Joi.string().min(30).max(150).required()
    }
    return Joi.validate(client, schema);
}

module.exports.Client = Client;
module.exports.validateClient = validateClient;