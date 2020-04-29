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

        it('should return 200 if valid request', async () => {
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const result = await request(server).get('/api/base/' + base._id).set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should return 200 if valid request', async () => {
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const result = await request(server).get('/api/base/' + base._id).set('x-auth-token', token);
            console.log(base._id.toString());
            expect(result.body).toHaveProperty('_id', base._id.toString());
        });

    });

    describe('POST /', () => {

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).post('/api/base/').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).post('/api/base/');
            expect(result.status).toBe(401);
        });

        it('should return 403 if user not an admin', async () => {
            const result = await request(server).post('/api/base/').set('x-auth-token', token).send();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid request', async () => {
            const agent = new Agent({ isAdmin: true });
            token = agent.generateAuthToken();
            const result = await request(server).post('/api/base/').set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const agent = new Agent({ isAdmin: true });
            token = agent.generateAuthToken();
            const base = {
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            };
            const result = await request(server).post('/api/base/').set('x-auth-token', token).send(base);
            expect(result.status).toBe(200);
        });

        it('should return save the data to the DB if valid request', async () => {
            const agent = new Agent({ isAdmin: true });
            token = agent.generateAuthToken();
            const base = {
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            };
            await request(server).post('/api/base/').set('x-auth-token', token).send(base);
            const result = await Base.findOne({ B_Name: base.B_Name, adress: base.adress, phone: base.phone });
            expect(result).toBeTruthy();
        });

        it('should return the data if valid request', async () => {
            const agent = new Agent({ isAdmin: true });
            token = agent.generateAuthToken();
            const base = {
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            };
            const result = await request(server).post('/api/base/').set('x-auth-token', token).send(base);

            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['B_Name', 'Region', 'city', 'adress', 'phone']));
        });

    });

    describe('PUT /:id', async () => {

        it('should return 401 if user not logged in', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await request(server).put('/api/base/' + id).send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await request(server).put('/api/base/' + id).set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 403 if user not admin', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await request(server).put('/api/base/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(403);
        });

        it('should return 400 if data given', async () => {
            const id = mongoose.Types.ObjectId();
            const agent = new Agent({ isAdmin: true });
            token = agent.generateAuthToken();
            const result = await request(server).put('/api/base/' + id).set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id given', async () => {
            const agent = new Agent({ isAdmin: true });
            token = agent.generateAuthToken();
            const result = await request(server).put('/api/base/+').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
        });

        it('should return 404 if base with the given id wasnt found', async () => {
            const agent = new Agent({ isAdmin: true });
            token = agent.generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const base = {
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            };
            const result = await request(server).put('/api/base/' + id).set('x-auth-token', token).send(base);
            expect(result.status).toBe(404);
        });



        it('should return 200 if valid request', async () => {
            const agent = new Agent({ isAdmin: true });
            token = agent.generateAuthToken();
            const base = {
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            };
            const response = await new Base(base).save();
            base.city = 'modified city';
            const result = await request(server).put('/api/base/' + response._id).set('x-auth-token', token).send(base);
            expect(result.status).toBe(200);
        });


        //  should save the changes if valid request
        //  should return the modified data
    });

});