const request = require('supertest');
const mongoose = require('mongoose');

const { Agent } = require('../../../models/agent');
const { Base } = require('../../../models/base');
const { Mechanic } = require('../../../models/mechanic');

let mechanicData;
let mechanic;
let server;
let token;
let base;
let id;



describe('/api/mechanic', () => {

    beforeEach(() => {
        server = require('../../../index');
        token = new Agent({ isAdmin: true }).generateAuthToken();
        base = new Base({
            B_Name: 'Base1',
            Region: 'Region1',
            city: 'city1',
            adress: 'Street, New York, NY 10030',
            phone: '12345678'
        });
        mechanicData = {
            ID_Base: base._id,
            FirstName: 'FirstName M2',
            LastName: 'LastName M2',
            phone: '22445588',
            salary: 777
        };
        mechanic = new Mechanic(mechanicData);
        id = mechanic._id;
    });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Base.remove({});
        await Mechanic.remove({});
    });
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        const exec = async () => {
            return await request(server).get('/api/mechanics').set('x-auth-token', token).send()
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 200 if valid request', async () => {
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the list of mechanics if valid request', async () => {
            await base.save();
            await Mechanic.collection.insertMany([{
                ID_Base: base._id,
                FirstName: 'FirstName M1',
                LastName: 'LastName M1',
                phone: '11223344',
                salary: 800
            }, {
                ID_Base: base._id,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            }]);
            const result = await exec();
            expect(result.body.length).toBe(2);
        });

    });

    describe('GET /:id', () => {

        const exec = async () => {
            return await request(server).get('/api/mechanics/' + id).set('x-auth-token', token).send();
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 400 if invalid id provided', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no mechanic with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            await mechanic.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return list of mechanics if valid request', async () => {
            await base.save();
            await mechanic.save();
            const result = await exec();
            expect(result.body).toHaveProperty('phone', mechanic.phone);
            expect(result.body).toHaveProperty('FirstName', mechanic.FirstName);
        });
    });

    describe('POST /', () => {

        const exec = async () => {
            return await request(server).post('/api/mechanics/').set('x-auth-token', token).send(mechanicData);
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 403 if user not admin', async () => {
            token = new Agent().generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid data provided', async () => {
            mechanicData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid base provided', async () => {
            mechanicData.ID_Base = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid Base.');
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should  save the mechanic if valid request', async () => {
            await base.save();
            await exec();
            const result = await Mechanic.findOne({ phone: mechanic.phone });
            expect(result).toHaveProperty('phone', mechanic.phone);
        });

        it('should return the mechanic if valid request', async () => {
            await base.save();
            const result = await exec();
            expect(result.body).toHaveProperty('phone', mechanic.phone);
        });

    });

    describe('PUT /:id', () => {

        const exec = async () => {
            return await request(server).put('/api/mechanics/' + id).set('x-auth-token', token).send(mechanicData);
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 403 if user not admin', async () => {
            token = new Agent().generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id provided', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no mechanic with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 400 if invalid data provided', async () => {
            await base.save();
            await mechanic.save();
            mechanicData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid base', async () => {
            await base.save();
            await mechanic.save();
            mechanicData.ID_Base = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid Base.');
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            await mechanic.save();
            mechanicData.FirstName = 'changed first name';
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should save the changes in the db if valid request', async () => {
            await base.save();
            await mechanic.save();
            mechanicData.FirstName = 'changed first name';
            await exec();
            const result = await Mechanic.findById(mechanic);
            expect(result).toHaveProperty('FirstName', mechanicData.FirstName);
        });

        it('should return the modified mechanic if valid request', async () => {
            await base.save();
            await mechanic.save();
            mechanicData.FirstName = 'changed first name';
            const result = await exec();
            expect(result.body).toHaveProperty('phone', mechanicData.phone);
        });

    });

    describe('DELETE /:id', () => {

        const exec = async () => {
            return await request(server).delete('/api/mechanics/' + id).set('x-auth-token', token).send();
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 403 if user not admin', async () => {
            token = new Agent().generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id provided', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no mechanic with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            await mechanic.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should remove the db from the db if valid request', async () => {

            await base.save();
            await mechanic.save();
            await exec();
            const result = await Mechanic.findById(mechanic._id);
            expect(result).not.toBeTruthy();
        });

        it('should return the deleted mechanic if valid request', async () => {
            await base.save();
            await mechanic.save();
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'FirstName', 'LastName', 'phone', 'salary']));
        });

    });
});
