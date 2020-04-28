const request = require('supertest');
const mongoose = require('mongoose');
const { Base } = require('../../../models/base');
const { Agent } = require('../../../models/agent');
let server;
let token

describe('/api/base', () => {

    beforeEach(() => {
        server = require('../../../index');
        token = new Agent().generateAuthToken();
    });

    afterEach(async () => {
        await server.close();
        await Base.remove({});
    });

    describe('GET /', () => {

        it('should return 200 if valid request', async () => {
            const result = await request(server).get('/api/base').set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should return all the bases if valid request', async () => {
            Base.collection.insertMany([
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
            const result = await request(server).get('/api/base').set('x-auth-token', token);
            expect(result.body.length).toBe(2);
            expect(result.body.some(base => base.B_Name === 'Base1')).toBeTruthy();
            expect(result.body.some(base => base.B_Name === 'Base2')).toBeTruthy();
        });

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/base');
            expect(result.status).toBe(401);
        });

    });

    describe('GET /:id', () => {

        it('should return 400 if invalid id', async () => {
            const result = await request(server).get('/api/base/1').set('x-auth-token', token);
            expect(result.status).toBe(400);
        });

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/base');
            expect(result.status).toBe(401);
        });

        it('should return 404 if requested base dosent exist', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/base/' + id).set('x-auth-token', token);
            expect(result.status).toBe(404);
        });

        //should return 200 if valid request
        //should return the requested base if valid request
    });

});