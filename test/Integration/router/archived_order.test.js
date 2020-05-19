const mongoose = require('mongoose');
const request = require('supertest');

const { Agent } = require('../../../models/agent');
const { ArchivedOrder } = require('../../../models/archived_order');

let archived_order;
let ID_mock;
let server;
let token;
let id;

describe('/api/archived_orders', () => {

    beforeEach(() => {
        server = require('../../../index');
        token = new Agent({ isAdmin: true }).generateAuthToken();
        ID_mock = mongoose.Types.ObjectId();
        archived_order = new ArchivedOrder({
            ID_Client: ID_mock,
            ID_Car: ID_mock,
            Order_Date: '2002-12-10T00:00:00.000Z',
            Rent_Start_Date: '2002-12-22T00:00:00.000Z',
            Rent_End_Date: '2003-01-22T00:00:00.000Z'
        });
        id = archived_order._id;
    });
    afterEach(async () => {
        await server.close();
        await ArchivedOrder.remove({});
    });
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        const exec = async () => {
            return await request(server).get('/api/archived_orders').set('x-auth-token', token).send();
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

        it('should return 403 user not admin', async () => {
            token = new Agent().generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 200 if valid request', async () => {
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the list or archived orders if valid request', async () => {
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
            const result = await exec();
            expect(result.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {

        const exec = async () => {
            return await request(server).get('/api/archived_orders/' + id).set('x-auth-token', token).send();
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

        it('should return 403 user not admin', async () => {
            token = new Agent().generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id given', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 404 if not archived order corresponds to the given id', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await archived_order.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the requested archived_order if valid request', async () => {
            await archived_order.save();
            const result = await exec();
            expect(result.body).toHaveProperty('Order_Date', '2002-12-10T00:00:00.000Z');
            expect(result.body).toHaveProperty('Rent_Start_Date', '2002-12-22T00:00:00.000Z');
            expect(result.body).toHaveProperty('Rent_End_Date', '2003-01-22T00:00:00.000Z');
        });

    });


});