const mongoose = require('mongoose');
const request = require('supertest');

const { Agent } = require('../../../models/agent');
const { Client } = require('../../../models/client');

let server;




describe('/api/client', () => {

    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => {
        await server.close();
        await Agent.remove({});
        await Client.remove({});
    });
    afterAll(() => mongoose.disconnect());

    describe('GET /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/clients').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).get('/api/clients').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/clients').set('x-auth-token', token).send();
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
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/clients').set('x-auth-token', token).send();
            expect(result.body.length).toBe(2);
        });
    });

    describe('GET /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).get('/api/clients/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).get('/api/clients/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).get('/api/clients/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
        });

        it('should return 404 if no client corresponds to the given id', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).get('/api/clients/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const client = new Client({
                CIN: '22222222',
                FirstName: 'FirstNameClient2',
                LastName: 'LastNameClient2',
                phone: '22222222',
                address: 'Client 2 Address Line.........'
            });
            client.save();
            const result = await request(server).get('/api/clients/' + client._id).set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });

        it('should return the requested client if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const client = new Client({
                CIN: '22222222',
                FirstName: 'FirstNameClient2',
                LastName: 'LastNameClient2',
                phone: '22222222',
                address: 'Client 2 Address Line.........'
            });
            client.save();
            const result = await request(server).get('/api/clients/' + client._id).set('x-auth-token', token).send();
            expect(result.body).toHaveProperty('phone', client.phone);
        });

    });

    describe('POST /', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).post('/api/clients/').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).post('/api/clients/').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid data given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).post('/api/clients/').set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 400 if client already exists in db', async () => {
            const token = new Agent().generateAuthToken();
            const clientData = {
                CIN: '22222222',
                FirstName: 'FirstNameClient2',
                LastName: 'LastNameClient2',
                phone: '22222222',
                address: 'Client 2 Address Line.........'
            }
            const client = new Client(clientData);
            await client.save();
            const result = await request(server).post('/api/clients/').set('x-auth-token', token).send(clientData);
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const clientData = {
                CIN: '22222222',
                FirstName: 'FirstNameClient2',
                LastName: 'LastNameClient2',
                phone: '22222222',
                address: 'Client 2 Address Line.........'
            }
            const result = await request(server).post('/api/clients/').set('x-auth-token', token).send(clientData);
            expect(result.status).toBe(200);
        });

        it('should save the client in the db if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const clientData = {
                CIN: '22222222',
                FirstName: 'FirstNameClient2',
                LastName: 'LastNameClient2',
                phone: '22222222',
                address: 'Client 2 Address Line.........'
            }
            await request(server).post('/api/clients/').set('x-auth-token', token).send(clientData);
            const result = await Client.findOne({ phone: clientData.phone });
            expect(result).toBeTruthy();
        });

        it('should save the client in the db if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const clientData = {
                CIN: '22222222',
                FirstName: 'FirstNameClient2',
                LastName: 'LastNameClient2',
                phone: '22222222',
                address: 'Client 2 Address Line.........'
            }
            const result = await request(server).post('/api/clients/').set('x-auth-token', token).send(clientData);
            expect(result.body).toHaveProperty('phone', clientData.phone);
        });

    });

    describe('PUT /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).put('/api/clients/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).put('/api/clients/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).put('/api/clients/1').set('x-auth-token', token).send();
            expect(result.status).toBe(400);
        });

        it('should return 404 if no client corresponds to the given id', async () => {
            const token = new Agent().generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).put('/api/clients/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 400 if invalid data given', async () => {
            const token = new Agent().generateAuthToken();
            const client = new Client({
                CIN: '22222222',
                FirstName: 'FirstNameClient2',
                LastName: 'LastNameClient2',
                phone: '22222222',
                address: 'Client 2 Address Line.........'
            });
            await client.save();
            const result = await request(server).put('/api/clients/' + client._id).set('x-auth-token', token).send({});
            expect(result.status).toBe(400);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const clientData = {
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            };
            const client = new Client(clientData);
            await client.save();
            const result = await request(server).put('/api/clients/' + client._id).set('x-auth-token', token).send(clientData);
            expect(result.status).toBe(200);
        });

        it('should save the changes in the db if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const clientData = {
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            };
            const client = new Client(clientData);
            await client.save();
            clientData.FirstName = 'modified first name';
            await request(server).put('/api/clients/' + client._id).set('x-auth-token', token).send(clientData);
            const result = await Client.findOne({ FirstName: clientData.FirstName });
            expect(result).toBeTruthy();
        });

        it('should return the modified client if valid request', async () => {
            const token = new Agent().generateAuthToken();
            const clientData = {
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            };
            const client = new Client(clientData);
            await client.save();
            clientData.FirstName = 'modified first name';
            const result = await request(server).put('/api/clients/' + client._id).set('x-auth-token', token).send(clientData);
            expect(result.body).toHaveProperty('phone', clientData.phone);
        });
    });

    describe('DELETE /:id', () => {

        it('should return 401 if user not logged in', async () => {
            const result = await request(server).delete('/api/clients/1').send();
            expect(result.status).toBe(401);
        });

        it('should return 400 if invalid token given', async () => {
            const result = await request(server).delete('/api/clients/1').set('x-auth-token', null).send();
            expect(result.status).toBe(400);
        });

        it('should return 403 if user not admin', async () => {
            const token = new Agent().generateAuthToken();
            const result = await request(server).delete('/api/clients/1').set('x-auth-token', token).send();
            expect(result.status).toBe(403);
        });

        it('should return 400 if invalid id given', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const result = await request(server).delete('/api/clients/1').set('x-auth-token', token).send();
            console.log(result.error.text);
            expect(result.status).toBe(400);
        });

        it('should return 404 if no client corresponds to the given id', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const id = mongoose.Types.ObjectId();
            const result = await request(server).delete('/api/clients/' + id).set('x-auth-token', token).send();
            expect(result.status).toBe(404);
        });

        it('should return 200 if valid request', async () => {
            const token = new Agent({ isAdmin: true }).generateAuthToken();
            const clientData = {
                CIN: '11111111',
                FirstName: 'FirstNameClient1',
                LastName: 'LastNameClient1',
                phone: '11111111',
                address: 'Client 1 Address Line.........'
            };
            const client = new Client(clientData);
            await client.save();
            const result = await request(server).delete('/api/clients/' + client._id).set('x-auth-token', token).send();
            expect(result.status).toBe(200);
        });
        //  should return 200 if valid request
        //  the client with the given id shouldn't exist in the db if valid request
        //  should return the deleted client if valid request
    });

});