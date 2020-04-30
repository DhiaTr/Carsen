const request = require('supertest');
const mongoose = require('mongoose');
const { Base } = require('../../../models/base');
const { Agent } = require('../../../models/agent');

let server;
let token;
let base;
let id;

describe('/api/base', () => {

    beforeEach(() => {
        server = require('../../../index');

        agent = new Agent({ isAdmin: true });
        token = agent.generateAuthToken();

        baseData = {
            B_Name: 'Base1',
            Region: 'Region1',
            city: 'city1',
            adress: 'Street, New York, NY 10030',
            phone: '12345678'
        };

        base = new Base(baseData);
        id = base._id;
    });

    afterEach(async () => {
        await server.close();
        await Base.remove({});
    });
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        const exec = async () => {
            return await request(server).get('/api/base').set('x-auth-token', token);
        }

        it('should return 200 if valid request', async () => {
            const result = await exec();
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
            const result = await exec();
            expect(result.body.length).toBe(2);
            expect(result.body.some(base => base.B_Name === 'Base1')).toBeTruthy();
            expect(result.body.some(base => base.B_Name === 'Base2')).toBeTruthy();
        });

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

    });

    describe('GET /:id', () => {

        const exec = async () => {
            return await request(server).get('/api/base/' + id).set('x-auth-token', token);
        }

        it('should return 400 if invalid id', async () => {
            id = 1;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 404 if requested base dosent exist', async () => {
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const result = await exec();
            expect(result.body).toHaveProperty('_id', base._id.toString());
        });

    });

    describe('POST /', () => {

        const exec = async () => {
            return await request(server).post('/api/base/').set('x-auth-token', token).send(baseData);
        };

        it('should return 400 if invalid token given', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 403 if user not an admin', async () => {
            agent.isAdmin = false;
            token = agent.generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid request', async () => {
            baseData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return save the data to the DB if valid request', async () => {
            await exec();
            const result = await Base.findOne({ B_Name: base.B_Name, adress: base.adress, phone: base.phone });
            expect(result).toBeTruthy();
        });

        it('should return the data if valid request', async () => {
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['B_Name', 'Region', 'city', 'adress', 'phone']));
        });

    });

    describe('PUT /:id', () => {

        const exec = async () => {
            return await request(server).put('/api/base/' + id).set('x-auth-token', token).send(baseData);
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 403 if user not admin', async () => {
            agent.isAdmin = false;
            token = agent.generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid data given', async () => {
            baseData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id given', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 404 if base with the given id wasnt found', async () => {
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            baseData.city = 'modified city';
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should save the changes if valid request', async () => {
            await base.save();
            baseData.city = 'modified city';
            await exec();
            const result = await Base.findById(base._id);
            expect(result).toHaveProperty('city', 'modified city');
        });

        it('should return the modified data if valid request', async () => {
            await base.save();
            baseData.city = 'modified city';
            const result = await exec();
            expect(result.body).toHaveProperty('city', 'modified city');
        });

    });


    describe('DELETE /:id', () => {

        const exec = async () => {
            return await request(server).delete('/api/base/' + id).set('x-auth-token', token).send();
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });


        it('should return 400 if invalid token given', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 403 if user not admin', async () => {
            agent.isAdmin = false;
            token = agent.generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id given', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 404 if base with the given id wasnt found', async () => {
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('data shouldn\'t exist in db after successful request', async () => {
            await base.save();
            await exec();
            const result = await Base.findById(id);
            expect(result).not.toBeTruthy();
        });

        it('should return the deleted item if valid request', async () => {
            await base.save();
            const result = await request(server).delete('/api/base/' + id).set('x-auth-token', token).send();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['_id', 'B_Name', 'Region', 'city', 'adress', 'phone']));
        });
    });

});