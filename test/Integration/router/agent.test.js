const request = require('supertest');
const { Agent } = require('../../../models/agent');
let server;


describe('/api/agent', () => {

    beforeEach(() => server = require('../../../index'));
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
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
            await Base.collection.insertMany([
                {
                    B_Name: 'Base1',
                    Region: 'Region1',
                    city: 'city1',
                    adress: 'Street, New York, NY 10030',
                    phone: '12345678'
                }, {
                    B_Name: 'Base2',
                    Region: 'Region2',
                    city: 'city2',
                    adress: 'Cecilia Chapman 711-2880 Nulla St.',
                    phone: '12345678'
                }
            ]);
            token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/agents').set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

    });





    // GET /
    //  should return the agents if valid request

    // GET /:id
    //  should return 401 if user not logged in
    //  should return 400 if invalid token provided
    //  should return 400 if invalid id provided
    //  should return 404 if no agent with the given id found
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