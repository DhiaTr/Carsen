const request = require('supertest');
const mongoose = require('mongoose');

const { Agent } = require('../../../models/agent');
const { Client } = require('../../../models/client');
const { Car } = require('../../../models/car');
const { Order } = require('../../../models/order');

let server;

describe('/api/orders', () => {

    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Client.remove({});
        await Order.remove({});
        await Car.remove({});
    });

    describe('GET /', () => {

        it('should return 401 if user not logged in ', async () => {
            const result = await request(server).get('/api/orders').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).get('/api/orders').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/orders').set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return the orders list if valid request', async () => {
            const ID_mock = mongoose.Types.ObjectId();
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
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/orders').set('x-auth-token', token).send();
            expect(result.body.length).toBe(2);
        });
        // *for the current base
    });

    describe('GET /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/orders/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).get('/api/orders/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/orders/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
        });

        it('should return 404 if no order with the given id exists', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/orders/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const order = new Order({
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            });
            order.save();
            const result = await request(server).get('/api/orders/' + order._id).set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const order = new Order({
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            });
            order.save();
            const result = await request(server).get('/api/orders/' + order._id).set('x-auth-token', token).send();
            expect(result.body).toHaveProperty('Rent_Start_Date', '2002-12-10T00:00:00.000Z');
            expect(result.body).toHaveProperty('ID_Car', ID_mock.toHexString());
        });
    });

    describe('POST /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).post('/api/orders/').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).post('/api/orders/').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid data given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).post('/api/orders/').set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 400 if no client with the given id exists', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const orderData = {
                ID_Client: ID_mock,
                ID_Car: ID_mock,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            };
            const result = await request(server).post('/api/orders/').set('x-auth-token', token).send(orderData);
            expect(result.status).toBe(400);
        });

        it('should return 400 if no car with the given id exists', async () => {
            const token = new Agent().generateAuthToken();
            const client = new Client({
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            });
            client.save();
            const ID_mock = mongoose.Types.ObjectId();
            const orderData = {
                ID_Client: client._id,
                ID_Car: ID_mock,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            };
            const result = await request(server).post('/api/orders/').set('x-auth-token', token).send(orderData);
            expect(result.status).toBe(400);
        });

        it('', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const client = new Client({
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            });
            await client.save();
            const car = new Car({
                ID_Base: ID_mock,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            });
            await car.save();
            const orderData = {
                ID_Client: client._id,
                ID_Car: car._id,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            };
            const order = new Order(orderData);
            await order.save();
            const result = await request(server).post('/api/orders/').set('x-auth-token', token).send(orderData);
            console.log(result.error.text);
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const client = new Client({
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            });
            await client.save();
            const car = new Car({
                ID_Base: ID_mock,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            });
            await car.save();
            const orderData = {
                ID_Client: client._id,
                ID_Car: car._id,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            };
            const result = await request(server).post('/api/orders/').set('x-auth-token', token).send(orderData);
            expect(result.status).toBe(200);
        });

        it('should save the data in the db if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const client = new Client({
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            });
            await client.save();
            const car = new Car({
                ID_Base: ID_mock,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            });
            await car.save();
            const orderData = {
                ID_Client: client._id,
                ID_Car: car._id,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            };
            await request(server).post('/api/orders/').set('x-auth-token', token).send(orderData);
            const result = await Order.findOne({ ID_Client: client._id, ID_Car: car._id });
            console.log(result);
            expect(result).toBeTruthy();
        });

        it('should save the data in the db if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = mongoose.Types.ObjectId();
            const client = new Client({
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            });
            await client.save();
            const car = new Car({
                ID_Base: ID_mock,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            });
            await car.save();
            const orderData = {
                ID_Client: client._id,
                ID_Car: car._id,
                Rent_Start_Date: '2002-12-10T00:00:00.000Z',
                Rent_End_Date: '2003-01-10T00:00:00.000Z'
            };
            const result = await request(server).post('/api/orders/').set('x-auth-token', token).send(orderData);
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Client', 'ID_Car', 'Rent_Start_Date', 'Rent_End_Date']));
        });
    });

    describe('PUT /:id', () => {


        it('should return 401 if user not logged in', async () => {
            const result = await request(server).put('/api/orders/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).put('/api/orders/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).put('/api/orders/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
        });

        it('should return 404 if no order with the given id exists', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).put('/api/orders/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        //  should return 404 if order dosent exist
        //  should return 400 if invalid data given
        //  should return 400 if no client with the given id exists
        //  should return 400 if no car with the given id exists
        //  should return 200 if valid request
        //  should save the changes in the db if valid request
        //  should return the changed order if valid request
    });

    // DELETE /:id
    //  should return 401 if user not logged in
    //  should return 400 if invalid token given
    //  should return 403 if user not admin
    //  should return 400 if invalid id given
    //  should return 404 if order dosent exist
    //  should return 200 if valid request
    //  should remove the order with the givn id from the db
    //  should return the deleted order if valid request














});
