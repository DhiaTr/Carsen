const request = require('supertest');
const mongoose = require('mongoose');
const { Agent } = require('../../../models/agent');
const { Base } = require('../../../models/base');
let server;


describe('/api/agent', () => {

    beforeEach(() => server = require('../../../index'));
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
            token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/agents').set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should return the agents if valid request', async () => {
            const base =new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            await Agent.collection.insertMany([{
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                Lastname: 'Smith',
                phone: '22556688',
                salary: 1234,
                password: '123456'
            },{
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent2',
                Lastname: 'Smith',
                phone: '33669955',
                salary: 1425,
                password: '234567'
            }
        ]);
            token = new Agent().generateAuthToken();
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
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/agents/1').set('x-auth-token', token);
            expect(result.error.text).toBe('Invalid id provided.');
            expect(result.status).toBe(400);
        });

        it('should return 404 if no agent with the given was found', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/agents/' + id).set('x-auth-token', token);
            expect(result.error.text).toBe('no agent with the given id was found.');
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            const base =new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/agents/' + agent._id).set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should return the requested agent if valid request', async () => {
            const base =new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const agent = new Agent({
                ID_Base: { _id: base._id, B_Name: base.B_Name },
                FirstName: 'Agent1',
                LastName: 'Smith',
                phone: '22556688',
                salary: 1234,
                password: '123456'
            });
            await agent.save();
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/agents/' + agent._id).set('x-auth-token', token);
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'FirstName', 'LastName', 'phone', 'salary', 'password']));
        });

    })

    // GET /:id
    //  should return 200 if valid request
    //  should return the agents if valid request

    // POST /
    //  should return 401 if user not logged in
    //  should return 403 if user not admin
    //  should return 400 if invalid token provided
    //  should return 400 if invalid data provided
    //  should return 200 if valid request
    //  should save the data if valid request
    //  should return the saved object

    // PUT /:id
    //  should return 401 if user not logged in
    //  should return 403 if user not admin
    //  should return 400 if invalid token provided
    //  should return 400 if invalid id provided
    //  should return 404 if no agent with the given id found
    //  should return 200 if valid request
    //  should save modified agent in the database if valid request
    //  should return the modified object

    // DELETE /:id
    //  should return 401 if user not logged in
    //  should return 403 if user not admin
    //  should return 400 if invalid token provided
    //  should return 400 if invalid id provided
    //  should return 404 if no agent with the given id found
    //  should return 200 if valid request
    //  the agent with the given id should exist in the db
    //  should return the deleted object

});