const mongoose = require('mongoose');
const request = require('supertest');

const { Agent } = require('../../../models/agent');
const { Mechanic } = require('../../../models/mechanic');
const { Base } = require('../../../models/base');
const { Car } = require('../../../models/car');
const { Repair } = require('../../../models/repair');

let server;


describe('/api/repair', () => {

    beforeEach(() => { server = require('../../../index'); })
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Mechanic.remove({});
        await Base.remove({});
        await Car.remove({});
        await Repair.remove({});
    });
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/repairs').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).get('/api/repairs').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/repairs').set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return the repair list if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            await Repair.collection.insertMany([{
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-09',
                costs: 1
            }, {
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10',
                costs: 2
            }]);

            const result = await request(server).get('/api/repairs').set('x-auth-token', token).send();
            expect(result.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/repairs/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).get('/api/repairs/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/repairs/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no repair corrsponds to the given id', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/repairs/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const repair = new Repair({
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            });
            repair.save();
            const result = await request(server).get('/api/repairs/' + repair._id).set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return the requested repair if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const repair = new Repair({
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            });
            repair.save();
            const result = await request(server).get('/api/repairs/' + repair._id).set('x-auth-token', token).send();
            expect(result.body).toHaveProperty('Repair_Date', '2002-12-10T00:00:00.000Z');
        });
    });

    describe('POST /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).post('/api/repairs').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).post('/api/repairs').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid data given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).post('/api/repairs').set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid mechanic given', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const repairData = {
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            };
            const result = await request(server).post('/api/repairs').set('x-auth-token', token).send(repairData);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid mechanic id.')
        });

        it('should return 400 if invalid car given', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            mechanic = new Mechanic({
                ID_Base: ID_mock,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
            const repairData = {
                ID_Mechanic: mechanic._id,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            };
            const result = await request(server).post('/api/repairs').set('x-auth-token', token).send(repairData);
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid car id.')
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const mechanic = new Mechanic({
                ID_Base: ID_mock,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
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
            const repairData = {
                ID_Mechanic: mechanic._id,
                ID_Car: car._id,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            };
            const result = await request(server).post('/api/repairs').set('x-auth-token', token).send(repairData);
            expect(result.status).toBe(200);
        });

        it('should return save the repair if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const mechanic = new Mechanic({
                ID_Base: ID_mock,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
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
            const repairData = {
                ID_Mechanic: mechanic._id,
                ID_Car: car._id,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            };
            await request(server).post('/api/repairs').set('x-auth-token', token).send(repairData);
            const result = await Repair.findOne({ ID_Mechanic: mechanic._id, ID_Car: car._id, Repair_Date: '2002-12-10T00:00:00.000Z', costs: 1 });
            expect(result).toBeTruthy();
        });

        it('should return the saved repair if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const mechanic = new Mechanic({
                ID_Base: ID_mock,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
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
            const repairData = {
                ID_Mechanic: mechanic._id,
                ID_Car: car._id,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            };
            const result = await request(server).post('/api/repairs').set('x-auth-token', token).send(repairData);
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Mechanic', 'ID_Car', 'Repair_Date', 'costs']));
        });

        // checkif it already exists in POST
    });

    describe('PUT /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).put('/api/repairs/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).put('/api/repairs/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).put('/api/repairs/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no repair corrsponds to the given id', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).put('/api/repairs/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 400 if invalida data given', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const repair = new Repair({
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            });
            await repair.save();
            const result = await request(server).put('/api/repairs/' + repair._id).set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid mechanic given', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const repairData = {
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            }
            const repair = new Repair(repairData);
            await repair.save();
            const result = await request(server).put('/api/repairs/' + repair._id).set('x-auth-token', token).send(repairData);
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid car given', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const mechanic = new Mechanic({
                ID_Base: ID_mock,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
            const repairData = {
                ID_Mechanic: mechanic._id,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            }
            const repair = new Repair(repairData);
            await repair.save();
            const result = await request(server).put('/api/repairs/' + repair._id).set('x-auth-token', token).send(repairData);
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const mechanic = new Mechanic({
                ID_Base: ID_mock,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
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
            const repairData = {
                ID_Mechanic: mechanic._id,
                ID_Car: car._id,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            }
            const repair = new Repair(repairData);
            await repair.save();
            const result = await request(server).put('/api/repairs/' + repair._id).set('x-auth-token', token).send(repairData);
            expect(result.status).toBe(200);
        });

        it('should save the changes in the db if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const mechanic = new Mechanic({
                ID_Base: ID_mock,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
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
            const repairData = {
                ID_Mechanic: mechanic._id,
                ID_Car: car._id,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            }
            const repair = new Repair(repairData);
            await repair.save();
            repairData.costs = 2;
            await request(server).put('/api/repairs/' + repair._id).set('x-auth-token', token).send(repairData);
            const result = await Repair.findOne({ ID_Mechanic: mechanic._id, ID_Car: car._id, Repair_Date: '2002-12-10T00:00:00.000Z', });
            expect(result.costs).toBe(2);
        });

        it('should return the modified repair if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const mechanic = new Mechanic({
                ID_Base: ID_mock,
                FirstName: 'FirstName M2',
                LastName: 'LastName M2',
                phone: '22445588',
                salary: 777
            });
            await mechanic.save();
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
            const repairData = {
                ID_Mechanic: mechanic._id,
                ID_Car: car._id,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            }
            const repair = new Repair(repairData);
            await repair.save();
            repairData.costs = 2;
            const result = await request(server).put('/api/repairs/' + repair._id).set('x-auth-token', token).send(repairData);
            expect(result.body).toHaveProperty('costs', 2);
        });
    });

    describe('DELETE /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).delete('/api/repairs/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).delete('/api/repairs/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 403 if user not admin', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).delete('/api/repairs/1').set('x-auth-token', token).send();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const result = await request(server).delete('/api/repairs/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no repair corrsponds to the given id', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).delete('/api/repairs/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const repair = new Repair({
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            });
            repair.save();
            const result = await request(server).delete('/api/repairs/' + repair._id).set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should remove the repair with the given id from the db if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const repair = new Repair({
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            });
            repair.save();
            await request(server).delete('/api/repairs/' + repair._id).set('x-auth-token', token).send();
            const result = await Repair.findOne({ ID_Mechanic: ID_mock, ID_Car: ID_mock, Repair_Date: '2002-12-10T00:00:00.000Z', costs: 1 });
            expect(result).not.toBeTruthy();
        });

        it('should remove the repair with the given id from the db if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const ID_mock = new mongoose.Types.ObjectId();
            const repair = new Repair({
                ID_Mechanic: ID_mock,
                ID_Car: ID_mock,
                Repair_Date: '2002-12-10T00:00:00.000Z',
                costs: 1
            });
            repair.save();
            const result = await request(server).delete('/api/repairs/' + repair._id).set('x-auth-token', token).send();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Mechanic', 'ID_Car', 'Repair_Date', 'costs']));
        });


        //  should return the deleted repair
    });
});
