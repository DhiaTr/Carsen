const request = require('supertest');
const mongoose = require('mongoose');
const { Agent } = require('../../../models/agent');
const { Base } = require('../../../models/base');

let server;
let token;
let base;
let agent;

describe('/api/agent', () => {

    beforeEach(() => {
        agent = new Agent({ isAdmin: true });
        token = agent.generateAuthToken();
        base = new Base({
            B_Name: 'Base1',
            Region: 'Region1',
            city: 'city1',
            adress: 'Street, New York, NY 10030',
            phone: '12345678'
        });
        server = require('../../../index')
    });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Base.remove({});
    })
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/agents');
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).get('/api/agents').set('x-auth-token', null);
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const result = await request(server).get('/api/agents').set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should return the agents if valid request', async () => {

            await base.save();
            await Agent.collection.insertMany([{
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                Lastname: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            }, {
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent2',
                LastName: 'Smith',
                phone: '33669955',
                email: 'agent1mail@gmail.com',
                salary: 1425,
                password: '234567'
            }
            ]);
            const result = await request(server).get('/api/agents').set('x-auth-token', token);
            expect(result.body.length).toBe(2);
        });

    });

    describe('GET /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/agents/1');
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).get('/api/agents/1').set('x-auth-token', null);
            expect(result.error.text).toBe('invalid Token.');
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id provided', async () => {
            const result = await request(server).get('/api/agents/1').set('x-auth-token', token);
            expect(result.error.text).toBe('Invalid id provided.');
            expect(result.status).toBe(400);
        });

        it('should return 404 if no agent with the given was found', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/agents/' + id).set('x-auth-token', token);
            expect(result.error.text).toBe('no agent with the given id was found.');
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail@com',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            const result = await request(server).get('/api/agents/' + agent._id).set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should return the requested agent if valid request', async () => {
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            const result = await request(server).get('/api/agents/' + agent._id).set('x-auth-token', token);
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'FirstName', 'LastName', 'phone', 'email', 'salary', 'password']));
        });

    })


    describe('POST /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).post('/api/agents/').send({});
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).post('/api/agents/').send({}).set('x-auth-token', null);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 403 if user not admin', async () => {
            agent.isAdmin = false;
            const token = agent.generateAuthToken();
            const result = await request(server).post('/api/agents/').send({}).set('x-auth-token', token);
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid data provided', async () => {
            const result = await request(server).post('/api/agents/').send({}).set('x-auth-token', token);
            expect(result.status).toBe(400);
        });

        it('should return 400 if inavlid base given', async () => {
            const baseId = mongoose.Types.ObjectId();
            const agent = {
                ID_Base: baseId,
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            };
            const result = await request(server).post('/api/agents/').send(agent).set('x-auth-token', token);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid base id.');
        });

        it('should return 400 if user already exists', async () => {
            await base.save();
            const agent = {
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            };
            await new Agent(agent).save();
            agent.ID_Base = base._id;
            const result = await request(server).post('/api/agents/').send(agent).set('x-auth-token', token);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('agent already registred.');
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const agent = {
                ID_Base: base._id,
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            };
            const result = await request(server).post('/api/agents/').send(agent).set('x-auth-token', token);
            expect(result.status).toBe(200);

        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const agent = {
                ID_Base: base._id,
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            };
            await request(server).post('/api/agents/').send(agent).set('x-auth-token', token);
            const result = await Agent.findOne({ email: 'agent1mail@gmail.com' });
            expect(result).toBeTruthy();
        });

        it('should return the saved object if valid request', async () => {
            await base.save();
            const agent = {
                ID_Base: base._id,
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            };
            const result = await request(server).post('/api/agents/').send(agent).set('x-auth-token', token);
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'FirstName', 'LastName', 'phone', 'email', 'salary', 'password']));
        });

        // it supposed to crypt the password if valid request

    });

    describe('PUT /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).put('/api/agents/1').send({});
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).put('/api/agents/1').send({}).set('x-auth-token', null);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 403 if user not admin', async () => {
            agent.isAdmin = false;
            const token = agent.generateAuthToken();
            const result = await request(server).put('/api/agents/1').send({}).set('x-auth-token', token);
            expect(result.status).toBe(403);
        });

        it('should return 400 if inavlid id given', async () => {
            const result = await request(server).put('/api/agents/1').send({}).set('x-auth-token', token);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid id provided.');
        });

        it('should return 404 if no agent corresponds to the given id', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await request(server).put('/api/agents/' + id).send({}).set('x-auth-token', token);
            expect(result.status).toBe(404);
            expect(result.error.text).toBe('agent not found!');
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            const result = await request(server).put('/api/agents/' + agent._id).send(agent).set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should save modified agent if valid request', async () => {
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            agent.LastName = 'new LastName';
            await request(server).put('/api/agents/' + agent._id).send(agent).set('x-auth-token', token);
            const result = await Agent.findById(agent._id);
            expect(result).toHaveProperty('LastName', agent.LastName);
        });

        it('shoudl return the modified object if valid request', async () => {
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            agent.LastName = 'new LastName';
            const result = await request(server).put('/api/agents/' + agent._id).send(agent).set('x-auth-token', token);
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'FirstName', 'LastName', 'phone', 'email', 'salary', 'password']));
        });

    });

    describe('DELETE /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).delete('/api/agents/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).delete('/api/agents/1').send().set('x-auth-token', null);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 403 if user not admin', async () => {
            agent.isAdmin = false;
            token = agent.generateAuthToken();
            const result = await request(server).delete('/api/agents/1').send().set('x-auth-token', token);
            expect(result.status).toBe(403);
        });

        it('should return 400 if inavlid id given', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const result = await request(server).delete('/api/agents/1').send().set('x-auth-token', token);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid id provided.');
        });

        it('should return 404 if no agent corresponds to the given id', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await request(server).delete('/api/agents/' + id).send().set('x-auth-token', token);
            expect(result.status).toBe(404);
            expect(result.error.text).toBe('agent not found!');
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            const result = await request(server).delete('/api/agents/' + agent._id).send().set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('the agent with the given id shouldn\'t exist in the db', async () => {
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            await request(server).delete('/api/agents/' + agent._id).send().set('x-auth-token', token);

            const result = await Agent.findById(agent._id);
            expect(result).not.toBeTruthy();
        });

        it('should return the deleted agent data', async () => {
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                email: 'agent1mail@gmail.com',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            const result = await request(server).delete('/api/agents/' + agent._id).send().set('x-auth-token', token);

            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'FirstName', 'LastName', 'phone', 'email', 'salary', 'password']));
        });

    });
});