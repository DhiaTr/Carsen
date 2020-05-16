const mongoose = require('mongoose');
const request = require('supertest');

const { Agent } = require('../../../models/agent');
const { Mechanic } = require('../../../models/mechanic');
const { Base } = require('../../../models/base');
const { Car } = require('../../../models/car');
const { Repair } = require('../../../models/repair');

let repairData;
let mechanic;
let ID_mock;
let repair;
let server;
let token;
let car;
let id;

describe('/api/repair', () => {

    beforeEach(() => {
        server = require('../../../index');
        token = new Agent({ isAdmin: true }).generateAuthToken();
        ID_mock = new mongoose.Types.ObjectId();
        mechanic = new Mechanic({
            ID_Base: ID_mock,
            FirstName: 'FirstName M2',
            LastName: 'LastName M2',
            phone: '22445588',
            salary: 777
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
        repairData = {
            ID_Mechanic: mechanic._id,
            ID_Car: car._id,
            Repair_Date: '2002-12-10T00:00:00.000Z',
            costs: 1
        }
        repair = new Repair({
            ID_Mechanic: ID_mock,
            ID_Car: ID_mock,
            Repair_Date: '2002-12-10T00:00:00.000Z',
            costs: 1
        });
        id = repair._id;
    })
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

        const exec = async () => {
            return await request(server).get('/api/repairs').set('x-auth-token', token).send();
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

        it('should return 200 if valid request', async () => {
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the repair list if valid request', async () => {
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

            const result = await exec();
            expect(result.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {

        const exec = async () => {
            return await request(server).get('/api/repairs/' + id).set('x-auth-token', token).send();
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
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no repair corrsponds to the given id', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            repair.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the requested repair if valid request', async () => {
            repair.save();
            const result = await exec();
            expect(result.body).toHaveProperty('Repair_Date', '2002-12-10T00:00:00.000Z');
        });
    });

    describe('POST /', () => {

        const exec = async () => {
            return await request(server).post('/api/repairs').set('x-auth-token', token).send(repairData);
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
            repairData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid mechanic given', async () => {
            repairData.ID_Mechanic = ID_mock;
            repairData.ID_Car = ID_mock;
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid mechanic id.')
        });

        it('should return 400 if invalid car given', async () => {
            await mechanic.save()
            repairData.ID_Car = ID_mock;
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid car id.')
        });

        it('should return 200 if valid request', async () => {
            await mechanic.save();
            await car.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return save the repair if valid request', async () => {
            await mechanic.save();
            await car.save();
            await exec();
            const result = await Repair.findOne({ ID_Mechanic: mechanic._id, ID_Car: car._id, Repair_Date: '2002-12-10T00:00:00.000Z', costs: 1 });
            expect(result).toBeTruthy();
        });

        it('should return the saved repair if valid request', async () => {
            await mechanic.save();
            await car.save();
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Mechanic', 'ID_Car', 'Repair_Date', 'costs']));
        });

        // checkif it already exists in POST
    });

    describe('PUT /:id', () => {

        const exec = async () => {
            return await request(server).put('/api/repairs/' + id).set('x-auth-token', token).send(repairData);
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
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no repair corrsponds to the given id', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 400 if invalida data given', async () => {
            repairData.ID_Mechanic = ID_mock;
            repairData.ID_Car = ID_mock;
            await repair.save();
            repairData = {};
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid mechanic given', async () => {
            repairData.ID_Mechanic = ID_mock;
            repairData.ID_Car = ID_mock;
            await repair.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid car given', async () => {
            await mechanic.save();
            repairData.ID_Car = ID_mock;
            await repair.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            await mechanic.save();
            await car.save();
            await repair.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should save the changes in the db if valid request', async () => {
            await mechanic.save();
            await car.save();
            await repair.save();
            repairData.costs = 2;
            await exec();
            const result = await Repair.findOne({ ID_Mechanic: mechanic._id, ID_Car: car._id, Repair_Date: '2002-12-10T00:00:00.000Z', });
            expect(result.costs).toBe(2);
        });

        it('should return the modified repair if valid request', async () => {
            await mechanic.save();
            await car.save();
            await repair.save();
            repairData.costs = 2;
            const result = await exec();
            expect(result.body).toHaveProperty('costs', 2);
        });
    });

    describe('DELETE /:id', () => {

        const exec = async () => {
            return await request(server).delete('/api/repairs/' + id).set('x-auth-token', token).send();
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
            token = new Agent().generateAuthToken();
            const result = await exec();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id given', async () => {
            id = '1';
            const result = await exec();
            expect(result.status).toBe(400);
            expect(result.error.text).toBe('invalid id.');
        });

        it('should return 404 if no repair corrsponds to the given id', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            repair.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should remove the repair with the given id from the db if valid request', async () => {

            repair.save();
            await exec();
            const result = await Repair.findOne({ ID_Mechanic: ID_mock, ID_Car: ID_mock, Repair_Date: '2002-12-10T00:00:00.000Z', costs: 1 });
            expect(result).not.toBeTruthy();
        });

        it('should return the deleted repair if valid request', async () => {
            repair.save();
            const result = await exec();
            expect(Object.keys(result.body)).toEqual(
                expect.arrayContaining(['ID_Mechanic', 'ID_Car', 'Repair_Date', 'costs']));
        });

    });
});
