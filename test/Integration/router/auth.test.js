const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Agent } = require('../../../models/agent');

let server;

describe('/api/auth', () => {

    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => { await server.close(); })

    it('should return 400 if invalid data', async () => {
        const result = await request(server).post('/api/auth/').send({});
        expect(result.status).toBe(400);
    });

    it('should return 400 if agent dosent exist', async () => {
        const authData = {
            email: 'agent1@gmail.com',
            password: '123456'
        }
        const result = await request(server).post('/api/auth/').send(authData);
        expect(result.status).toBe(400);
        expect(result.error.text).toBe('Invalid email or password');
    });

    it('should return 400 if incorrect password', async () => {
        const agent = new Agent({
            ID_Base: { B_Name: 'base1' },
            FirstName: 'FirstName Agent1',
            LastName: 'lastName Agent1',
            phone: '11111111',
            email: 'admin@gmail.com',
            salary: 555
        });
        const salt = await bcrypt.genSalt(10);
        agent.password = await bcrypt.hash('123456', salt);
        await agent.save();

        const authData = {
            email: 'admin@gmail.com',
            password: '1234567'
        }
        const result = await request(server).post('/api/auth/').send(authData);
        expect(result.status).toBe(400);
    });

    it('should return 200 if valid request', async () => {
        const agent = new Agent({
            ID_Base: { B_Name: 'base1' },
            FirstName: 'FirstName Agent1',
            LastName: 'lastName Agent1',
            phone: '11111111',
            email: 'admin@gmail.com',
            salary: 555
        });
        const salt = await bcrypt.genSalt(10);
        agent.password = await bcrypt.hash('123456', salt);
        await agent.save();

        const authData = {
            email: 'admin@gmail.com',
            password: '123456'
        }
        const result = await request(server).post('/api/auth/').send(authData);
        expect(result.status).toBe(200);

    });
});