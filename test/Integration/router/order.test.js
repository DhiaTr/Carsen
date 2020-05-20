const request = require('supertest');
const mongoose = require('mongoose');

const { Agent } = require('../../../models/agent');
const { Client } = require('../../../models/client');
const { Car } = require('../../../models/car');
const { Order } = require('../../../models/order');

let orderData;
let ID_mock;
let client;
let server;
let order;
let token;
let car;
let id;

describe('/api/orders', () => {

    beforeEach(() => {
        server = require('../../../index');
        token = new Agent().generateAuthToken();
        ID_mock = mongoose.Types.ObjectId();
        client = new Client({
            CIN: '11111111',
            FirstName: 'FirstNameClient1',
            LastName: 'LastNameClient1',
            phone: '11111111',
            address: 'Client 1 Address Line.........'
        });
        car = new Car({
            ID_Base: ID_mock,
            Mark: 'Mark1',
            Model: 'Model1',
            Registration_Number: '123',
            production_Year: '1234',
            Rent_Price: 50,
            Category: 'category1'
        });
        orderData = {
            ID_Client: client._id,
            ID_Car: car._id,
            Rent_Start_Date: '2002-12-10T00:00:00.000Z',
            Rent_End_Date: '2003-01-10T00:00:00.000Z'
        };
        order = new Order(orderData);
        id = order._id;
    });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Client.remove({});
        await Order.remove({});
        await Car.remove({});
    });

    describe('GET /', () => {

        const exec = async () => {
            return await request(server).get('/api/orders').set('x-auth-token', token).send();
        }

        it('should return 401 if user not logged in ', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the orders list if valid request', async () => {
            await Order.collection.insertMany([{
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            }, {
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Rent_Start_Date: '2002-12-22T00:00:00.000Z',
                Rent_End_Date: '2003-02-22T00:00:00.000Z'
            }]);
            const result = await exec();
            expect(result.body.length).toBe(2);
        });
        // add for the current base filter
    });

    describe('GET /:id', () => {

        const exec = async () => {
            return await request(server).get('/api/orders/' + id).set('x-auth-token', token).send();
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

        it('should return 400 if invalid id given', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 404 if no order with the given id exists', async () => {
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            order.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the requested order if valid request', async () => {
            order.save();
            const result = await exec();
            expect(result.body).toHaveProperty('Rent_Start_Date', '2002-12-10T00:00:00.000Z');
            expect(result.body).toHaveProperty('ID_Car', car._id.toHexString());
        });
    });

    describe('POST /', () => {

        const exec = async () => {
            return await request(server).post('/api/orders/').set('x-auth-token', token).send(orderData);
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

        it('should return 400 if invalid data given', async () => {
            orderData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if no client with the given id exists', async () => {
            orderData.ID_Client = ID_mock;
            orderData.ID_Car = ID_mock;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if no car with the given id exists', async () => {
            client.save();
            orderData.ID_Client = client._id;
            orderData.ID_Car = ID_mock;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('return 400 if car already in use', async () => {
            await client.save();
            await car.save();
            await order.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            await client.save();
            await car.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should save the data in the db if valid request', async () => {
            await client.save();
            await car.save();
            await exec();
            const result = await Order.findOne({ ID_Client: client._id, ID_Car: car._id });
            console.log(result);
            expect(result).toBeTruthy();
        });

        it('should save the data in the db if valid request', async () => {
            await client.save();
            await car.save();
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Client', 'ID_Car', 'Rent_Start_Date', 'Rent_End_Date']));
        });
    });

    describe('PUT /:id', () => {

        const exec = async () => {
            return await request(server).put('/api/orders/' + id).set('x-auth-token', token).send(orderData);
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

        it('should return 400 if invalid id given', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 404 if no order with the given id exists', async () => {
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 400 if invalid data given', async () => {
            orderData = {};
            await order.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if no client with the given id exists', async () => {
            orderData.ID_Client = ID_mock;
            await order.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if no car with the given id exists', async () => {
            client.save();
            orderData.ID_Car = ID_mock;
            await order.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            await client.save();
            await car.save();
            await order.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should save the changes if valid request', async () => {
            await client.save();
            await car.save();
            await order.save();
            orderData.Rent_Start_Date = '2003-04-10T00:00:00.000Z';
            await exec();
            const result = await Order.findOne({ ID_Client: client._id, ID_Car: car._id, Rent_Start_Date: '2003-04-10T00:00:00.000Z' });
            expect(result).toBeTruthy();
        });

        it('should return the changed order if valid request', async () => {
            await client.save();
            await car.save();
            await order.save();
            orderData.Rent_Start_Date = '2003-04-10T00:00:00.000Z';
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Client', 'ID_Car', 'Rent_Start_Date', 'Rent_End_Date']));
        });

    });

    describe('DELETE /:id', () => {

        const exec = async () => {
            return await request(server).delete('/api/orders/' + id).set('x-auth-token', token).send();
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
            result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id given', async () => {
            token = new Agent({ isAdmin: true }).generateAuthToken();
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 404 if no order with the given id exists', async () => {
            token = new Agent({ isAdmin: true }).generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 valid request', async () => {
            token = new Agent({ isAdmin: true }).generateAuthToken();
            await order.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should delete the order valid request', async () => {
            token = new Agent({ isAdmin: true }).generateAuthToken();
            await order.save();
            await exec();
            const result = await Order.findById(order._id);
            expect(result).not.toBeTruthy();
        });

        it('should return the deleted order if valid request', async () => {
            token = new Agent({ isAdmin: true }).generateAuthToken();
            await order.save();
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Client', 'ID_Car', 'Rent_Start_Date', 'Rent_End_Date']));
        });

    });
});
