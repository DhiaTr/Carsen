const mongoose = require('mongoose');
const request = require('supertest');

const { Agent } = require('../../../models/agent');
const { Client } = require('../../../models/client');

let clientData;
let client;
let server;
let token;
let id;


describe('/api/client', () => {

    beforeEach(() => {
        server = require('../../../index');
        token = new Agent({ isAdmin: true }).generateAuthToken();
        clientData = {
            CIN: '11111111',
            FirstName: 'FirstNameClient1',
            LastName: 'LastNameClient1',
            phone: '11111111',
            address: 'Client 1 Address Line.........'
        };
        client = new Client(clientData);
        id = client._id;
    });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Client.remove({});
    });
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        const exec = async () => {
            return await request(server).get('/api/clients').set('x-auth-token', token).send();
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

        it('should return the list of clients if valid request', async () => {
            await Client.collection.insertMany([{
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            }, {
                CIN: '22222222',
                FirstName: 'FirstNameClient2',
                LastName: 'LastNameClient2',
                phone: '22222222',
                address: 'Client 2 Address Line.........'
            }]);
            const result = await exec();
            expect(result.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {

        const exec = async () => {
            return await request(server).get('/api/clients/' + id).set('x-auth-token', token).send();
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

        it('should return 404 if no client corresponds to the given id', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            client.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should return the requested client if valid request', async () => {
            client.save();
            const result = await exec();
            expect(result.body).toHaveProperty('phone', client.phone);
        });

    });

    describe('POST /', () => {

        const exec = async () => {
            return await request(server).post('/api/clients/').set('x-auth-token', token).send(clientData);
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
            clientData = {};
            const result = await exec()
            expect(result.status).toBe(400);
        });

        it('should return 400 if client already exists in db', async () => {
            await client.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should save the client in the db if valid request', async () => {
            await exec();
            const result = await Client.findOne({ phone: clientData.phone });
            expect(result).toBeTruthy();
        });

        it('should save the client in the db if valid request', async () => {
            const result = await exec();
            expect(result.body).toHaveProperty('phone', clientData.phone);
        });

    });

    describe('PUT /:id', () => {

        const exec = async () => {
            return await request(server).put('/api/clients/' + id).set('x-auth-token', token).send(clientData);
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

        it('should return 404 if no client corresponds to the given id', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 400 if invalid data given', async () => {
            clientData = {};
            await client.save();
            const result = await exec();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            await client.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('should save the changes in the db if valid request', async () => {
            await client.save();
            clientData.FirstName = 'modified first name';
            await exec();
            const result = await Client.findOne({ FirstName: clientData.FirstName });
            expect(result).toBeTruthy();
        });

        it('should return the modified client if valid request', async () => {
            await client.save();
            clientData.FirstName = 'modified first name';
            const result = await exec();
            expect(result.body).toHaveProperty('phone', clientData.phone);
        });
    });

    describe('DELETE /:id', () => {

        const exec = async () => {
            return await request(server).delete('/api/clients/' + id).set('x-auth-token', token).send();
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
            console.log(result.error.text);
            expect(result.status).toBe(400);
        });

        it('should return 404 if no client corresponds to the given id', async () => {
            id = mongoose.Types.ObjectId();
            const result = await exec();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            await client.save();
            const result = await exec();
            expect(result.status).toBe(200);
        });

        it('the client with the given id shouldn\'t exist in the db if valid request', async () => {
            await client.save();
            await exec();
            const result = await Client.findOne({ phone: clientData.phone });
            expect(result).not.toBeTruthy();
        });

        it('should return the deleted client if valid request', async () => {
            await client.save();
            const result = await exec();
            expect(result.body).toHaveProperty('phone', clientData.phone);
        });
    });
});