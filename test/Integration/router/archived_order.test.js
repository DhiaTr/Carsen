const mongoose = require('mongoose');
const request = require('supertest');

const { Agent } = require('../../../models/agent');
const { ArchivedOrder } = require('../../../models/archived_order');

let server;

describe('/api/archived_orders', () => {

    beforeEach(() => { server = require('../../../index'); })
    afterEach(async () => {
        await server.close();
        await ArchivedOrder.remove({});
    });
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/archived_orders').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).get('/api/archived_orders').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 403 user not admin', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/archived_orders').set('x-auth-token', token).send();
            expect(result.status).toBe(403);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const result = await request(server).get('/api/archived_orders').set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return the list or archived orders if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            await ArchivedOrder.collection.insertMany([{
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Order_Date: '2002-12-10T00:00:00.000Z',
                Rent_Start_Date: '2002-12-22T00:00:00.000Z',
                Rent_End_Date: '2003-01-22T00:00:00.000Z'
            }, {
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Order_Date: '2002-12-10T00:00:00.000Z',
                Rent_Start_Date: '2002-12-22T00:00:00.000Z',
                Rent_End_Date: '2003-01-22T00:00:00.000Z'
            }])
            const result = await request(server).get('/api/archived_orders').set('x-auth-token', token).send();
            expect(result.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/archived_orders/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).get('/api/archived_orders/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 403 user not admin', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/archived_orders/1').set('x-auth-token', token).send();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const result = await request(server).get('/api/archived_orders/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
        });

        it('should return 404 if not archived order corresponds to the given id', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/archived_orders/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const archived_order = new ArchivedOrder({
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Order_Date: '2002-12-10T00:00:00.000Z',
                Rent_Start_Date: '2002-12-22T00:00:00.000Z',
                Rent_End_Date: '2003-01-22T00:00:00.000Z'
            });
            await archived_order.save();
            const result = await request(server).get('/api/archived_orders/' + archived_order._id).set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return the requested archived_order if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const archived_order = new ArchivedOrder({
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Order_Date: '2002-12-10T00:00:00.000Z',
                Rent_Start_Date: '2002-12-22T00:00:00.000Z',
                Rent_End_Date: '2003-01-22T00:00:00.000Z'
            });
            await archived_order.save();
            const result = await request(server).get('/api/archived_orders/' + archived_order._id).set('x-auth-token', token).send();
            expect(result.body).toHaveProperty('Order_Date', '2002-12-10T00:00:00.000Z');
            expect(result.body).toHaveProperty('Rent_Start_Date', '2002-12-22T00:00:00.000Z');
            expect(result.body).toHaveProperty('Rent_End_Date', '2003-01-22T00:00:00.000Z');
        });

    });


});