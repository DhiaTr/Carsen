const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');

const { Agent } = require('../models/agent');

function validateAuth(agentAuthInfo) {
    schema = {
        email: Joi.string().min(10).max(150).required(),
        password: Joi.string().min(5).max(1024).required()
    }
    return Joi.validate(agentAuthInfo, schema);
}

router.post('/', async (req, res) => {

    const { error } = validateAuth(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const agent = await Agent.findOne({ email: req.body.email });
    if (!agent) return res.status(400).send('Invalid email or password');

    const validate = await bcrypt.compare(req.body.password, agent.password);
    if (!validate) return res.status(400).send('invalid email or password');

    const token = agent.generateAuthToken();

    res.send({token});

});


module.exports = router;