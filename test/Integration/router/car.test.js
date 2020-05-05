const request = require('supertest');
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
            base = new Base({
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


    // GET /:id
    //  should return 401 if not logged in
    //  should return 400 if invalid token provided
    //  should return 400 if invalid id provided
    //  should return 404 if no car with the given id exists
    //  should return 200 if valid request
    //  should return the requested car if valid request

    // POST /
    //  should return 401 if user not logged in
    //  should return 400 if invalid token provided
    //  should return 400 if invalid base given
    //  should return 400 if invalid data
    //  should return 200 if valid request
    //  should save the car if valid request
    //  should return the saved car if valid request

    // PUT /:id
    //  should return 401 if user not logged in
    //  should return 400 if invalid ntoken provided
    //  should return 400 if invalid id given
    //  should return 404 if car with the given id wasn't found
    //  should return 400 if invalid data provided
    //  should return 200 if valid request
    //  should save the changes if valid request
    //  should return the modified car if valid request

    // DELETE /:id
    //  should return 401 if user not logged in
    //  should return 400 if invalid token provided
    //  should return 400 if invalid id given
    //  should return 404 if a car with the given id wasn't found
    //  should return 200 if valid request
    //  the car with the given id shouldn't exist in the db
    //  should return the deleted car


});