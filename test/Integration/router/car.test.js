const request = require('supertest');
const mongoose = require('mongoose');
const { Agent } = require('../../../models/agent');
const { Base } = require('../../../models/base');
const { Car } = require('../../../models/car');
let token;
let base;
let carData;
let car;
let id;

describe('/api/car', () => {

    beforeEach(() => {
        server = require('../../../index');
        token = new Agent().generateAuthToken();
        base = new Base({
            B_Name: 'Base1',
            Region: 'Region1',
            city: 'city1',
            adress: 'Street, New York, NY 10030',
            phone: '12345678'
        });
        carData = {
            ID_Base: base._id,
            Mark: 'Mark1',
            Model: 'Model1',
            Registration_Number: '123',
            production_Year: '1234',
            Rent_Price: 50,
            Category: 'category1'
        }
        car = new Car(carData);
        id = car._id;
    });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Base.remove({});
        await Car.remove({});
    })
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        const exec = async () => {
            return await request(server).get('/api/cars/').set('x-auth-token', token).send();
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the cars if valid request', async () => {
            await base.save();
            await Car.collection.insertMany([{
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }, {
                ID_Base: base._id,
                Mark: 'Mark2',
                Model: 'Model2',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 40,
                Category: 'category2'
            }
            ]);
            const result = await exec();
            expect(result.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {

        const exec = async () => {
            return await request(server).get('/api/cars/' + id).set('x-auth-token', token).send();
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id provided', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid id provided.');
        });

        it('should return 404 if no car with the given id exists', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            await car.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the requested car if valid request', async () => {
            await base.save();
            await car.save();
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'Mark', 'Model', 'Registration_Number', 'production_Year', 'Rent_Price', 'Category']));
        });

    });

    describe('POST /', () => {

        const exec = async () => {
            return await request(server).post('/api/cars/').set('x-auth-token', token).send(carData);
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

        it('shoudl return 400 if invalid data given', async () => {
            carData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if inavlid base given', async () => {
            carData.ID_Base = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid base id.');
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return save the car if valid request', async () => {
            await base.save();
            await exec();
            const result = await Car.findOne({ Registration_Number: carData.Registration_Number });
            expect(result).toBeTruthy();
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'Mark', 'Model', 'Registration_Number', 'production_Year', 'Rent_Price', 'Category']));
        });
        // should return 403 if user not admin

    });

    describe('PUT /:id', () => {

        const exec = async () => {
            return await request(server).put('/api/cars/' + id).set('x-auth-token', token).send(carData);
        }

        it('should return 401 if user not logged in', async () => {
            token = '';
            const result = await exec();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token', async () => {
            token = null;
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id provided', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid id provided.');
        });

        it('should return 404 if no car with the given id was found', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 400 if invalid data provided', async () => {
            await base.save();
            await car.save();
            carData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            await car.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should save the changes if valid request', async () => {
            await base.save();
            await car.save();
            carData.Mark = 'Modified Mark';
            await exec();
            const result = await Car.findById(car._id);
            expect(result).toHaveProperty('Mark', carData.Mark);
        });

        it('should return the modified car if valid request', async () => {
            await base.save();
            await car.save();
            carData.Mark = 'Modified Mark';
            const result = await exec();
            expect(result.body).toHaveProperty('Mark', carData.Mark);
        });

        // should return 403 if user not admin
    });

    describe('DELETE /:id', () => {

        const exec = async () => {
            return await request(server).delete('/api/cars/' + id).set('x-auth-token', token).send();
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

        it('should return 400 if invalid id given', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid id provided.');
        });

        it('should return 404 if no car with the given id was found', async () => {
            const id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await base.save();
            await car.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should be deleted from the db if valid request', async () => {
            await base.save();
            await car.save();
            await exec();
            const result = await Car.findById(car._id);
            expect(result).not.toBeTruthy();
        });

        it('should return the deleted car', async () => {
            await base.save();
            await car.save();
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'Mark', 'Model', 'Registration_Number', 'production_Year', 'Rent_Price', 'Category']));
        });
        // should return 403 if user not admin
    });

});