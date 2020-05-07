const request = require('supertest');
const mongoose = require('mongoose');
const { Agent } = require('../../../models/agent');
const { Base } = require('../../../models/base');
const { Car } = require('../../../models/car');


describe('/api/car', () => {

    beforeEach(() => { server = require('../../../index') });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Base.remove({});
        await Car.remove({});
    })
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/cars/');
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token', async () => {
            const result = await request(server).get('/api/cars/').set('x-auth-token', null);
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/cars/').set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should return the cars if valid request', async () => {
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
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
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/cars/').set('x-auth-token', token);
            expect(result.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/cars/1');
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token', async () => {
            const result = await request(server).get('/api/cars/1').set('x-auth-token', null);
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id provided', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/cars/1').set('x-auth-token', token);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid id provided.');
        });

        it('should return 404 if no car with the given id exists', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/cars/' + id).set('x-auth-token', token);
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
            const car = new Car({
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            });
            await car.save();
            const result = await request(server).get('/api/cars/' + car._id).set('x-auth-token', token);
            expect(result.status).toBe(200);
        });

        it('should return the requested car if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const car = new Car({
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            });
            await car.save();
            const result = await request(server).get('/api/cars/' + car._id).set('x-auth-token', token);
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'Mark', 'Model', 'Registration_Number', 'production_Year', 'Rent_Price', 'Category']));
        });

    });

    describe('POST /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).post('/api/cars/').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).post('/api/cars/').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('shoudl return 400 if invalid data given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).post('/api/cars/').set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 400 if inavlid base given', async () => {
            const id = mongoose.Types.ObjectId();
            const car = {
                ID_Base: id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const token = new Agent().generateAuthToken();
            const result = await request(server).post('/api/cars/').set('x-auth-token', token).send(car);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid base id.');
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
            const car = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const token = new Agent().generateAuthToken();
            const result = await request(server).post('/api/cars/').set('x-auth-token', token).send(car);
            expect(result.status).toBe(200);
        });

        it('should return save the car if valid request', async () => {
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const car = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const token = new Agent().generateAuthToken();
            await request(server).post('/api/cars/').set('x-auth-token', token).send(car);
            const result = await Car.findOne({ Registration_Number: car.Registration_Number });
            expect(result).toBeTruthy();
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
            const car = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const token = new Agent().generateAuthToken();
            const result = await request(server).post('/api/cars/').set('x-auth-token', token).send(car);
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'Mark', 'Model', 'Registration_Number', 'production_Year', 'Rent_Price', 'Category']));
        });

    });

    describe('PUT /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).put('/api/cars/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token', async () => {
            const result = await request(server).put('/api/cars/1').set('x-auth-token', null);
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id provided', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).put('/api/cars/1').set('x-auth-token', token);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid id provided.');
        });

        it('should return 404 if no car with the given id was found', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).put('/api/cars/' + id).set('x-auth-token', token);
            expect(result.status).toBe(404);
        });

        it('should return 400 if invalid data provided', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const carData = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const car = new Car(carData);
            await car.save();
            const result = await request(server).put('/api/cars/' + car._id).set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
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
            const carData = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const car = new Car(carData);
            await car.save();
            const result = await request(server).put('/api/cars/' + car._id).set('x-auth-token', token).send(carData);
            expect(result.status).toBe(200);
        });

        it('should save the changes if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const carData = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const car = new Car(carData);
            await car.save();
            carData.Mark = 'Modified Mark';
            await request(server).put('/api/cars/' + car._id).set('x-auth-token', token).send(carData);

            const result = await Car.findById(car._id);
            expect(result).toHaveProperty('Mark', carData.Mark);
        });

        it('should return the modified car if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const carData = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const car = new Car(carData);
            await car.save();
            carData.Mark = 'Modified Mark';
            const result = await request(server).put('/api/cars/' + car._id).set('x-auth-token', token).send(carData);
            expect(result.body).toHaveProperty('Mark', carData.Mark);
        });
    });

    describe('DELETE /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).delete('/api/cars/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token provided', async () => {
            const result = await request(server).delete('/api/cars/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid Token.');
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).delete('/api/cars/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('Invalid id provided.');
        });

        it('should return 404 if no car with the given id was found', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).delete('/api/cars/' + id).set('x-auth-token', token);
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
            const carData = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const car = new Car(carData);
            await car.save();
            const result = await request(server).delete('/api/cars/' + car._id).set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should be deleted from the db if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const carData = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const car = new Car(carData);
            await car.save();
            await request(server).delete('/api/cars/' + car._id).set('x-auth-token', token).send();
            const result = await Car.findById(car._id);
            expect(result).not.toBeTruthy();
        });

        it('should return the deleted car', async () => {
            const token = new Agent().generateAuthToken();
            const base = new Base({
                B_Name: 'Base1',
                Region: 'Region1',
                city: 'city1',
                adress: 'Street, New York, NY 10030',
                phone: '12345678'
            });
            await base.save();
            const carData = {
                ID_Base: base._id,
                Mark: 'Mark1',
                Model: 'Model1',
                Registration_Number: '123',
                production_Year: '1234',
                Rent_Price: 50,
                Category: 'category1'
            }
            const car = new Car(carData);
            await car.save();
            const result = await request(server).delete('/api/cars/' + car._id).set('x-auth-token', token).send();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Base', 'Mark', 'Model', 'Registration_Number', 'production_Year', 'Rent_Price', 'Category']));
        });
    });

});