const request = require('supertest');
const mongoose = require('mongoose');

const { Agent } = require('../../../models/agent');
const { Base } = require('../../../models/base');
const { Mechanic } = require('../../../models/mechanic');

let server;



describe('/api/mechanic', () => {

    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Base.remove({});
        await Mechanic.remove({});
    });
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/mechanics').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).get('/api/mechanics').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/mechanics').set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return the list of mechanics if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
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
            const result = await request(server).get('/api/mechanics').set('x-auth-token', token).send();
            expect(result.body.length).toBe(2);
        });

    });

    describe('GET /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/mechanics/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).get('/api/mechanics/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 400 if invalid id provided', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/mechanics/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no mechanic with the given id was found', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/mechanics/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const mechanic = new Mechanic({
                ID_Base: base._id,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
            const result = await request(server).get('/api/mechanics/' + mechanic._id).set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const mechanic = new Mechanic({
                ID_Base: base._id,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
            const result = await request(server).get('/api/mechanics/' + mechanic._id).set('x-auth-token', token).send();
            expect(result.body).toHaveProperty('phone', mechanic.phone);
            expect(result.body).toHaveProperty('FirstName', mechanic.FirstName);
        });
    });

    describe('POST /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).post('/api/mechanics/').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).post('/api/mechanics/').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 403 if user not admin', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).post('/api/mechanics/').set('x-auth-token', token).send();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid data provided', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const result = await request(server).post('/api/mechanics/').set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid base provided', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const baseId = mongoose.Types.ObjectId();
            const mechanic = {
                ID_Base: baseId,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            };
            const result = await request(server).post('/api/mechanics/').set('x-auth-token', token).send(mechanic);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid Base.')
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const mechanic = {
                ID_Base: base._id,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            };
            const result = await request(server).post('/api/mechanics/').set('x-auth-token', token).send(mechanic);
            expect(result.status).toBe(200);
        });

        it('should return save the mechanic if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const mechanic = {
                ID_Base: base._id,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            };
            const result = await request(server).post('/api/mechanics/').set('x-auth-token', token).send(mechanic);
            expect(result.body).toHaveProperty('phone', mechanic.phone);
        });

        //  should return the new mechanic if valid request
    });

    // PUT /:id
    //  should return 401 if user not logged in
    //  should return 400 if invalid request
    //  should return 403 if user not admin
    //  should return 400 if invalid id
    //  should return 404 if no mechanic exists with the given id
    //  should return 400 if invalid base
    //  should return 400 if invalid data provided
    //  should return 200 if valid request
    //  should save the changes if valid request
    //  should return the modified mechanic if valid request

    // DELETE /:id
    //  should return 401 if user not admin
    //  should return 400 if invalid request
    //  should return 403 if user not admin
    //  should return 400 if invalid id
    //  should return 404 if not mechanic with the given id exists
    //  should return 200 if valid request
    //  should delete the requested mechanic from the db
    //  should return the deleted mechanic





});
