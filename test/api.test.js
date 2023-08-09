'use strict'

//Use .env file to load variables for test environment
process.env.NODE_ENV = 'test'
require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` })
const endpoint = process.env.SERVER_URL

const chai = require('chai');
const chaiHttp = require('chai-http');
const databaseService = require('../services/databaseService')
chai.use(chaiHttp);
const expect = chai.expect
let authToken;

// Test cases for user signup and login
describe('Drop and recreate Tables before test', () => {
  before(async () => {
    try {
      await databaseService.testConnection()
      await databaseService.sequelize.sync({ force: true });
    } catch (err) {
      console.error('Error synchronizing database:', err);
    }
  });

  describe('User API', () => {
  
    it('should register a new user', async() => {
      const newUser = {
        username: 'testuser',
        password: 'testpassword',
      };

      let res = await chai.request(endpoint)
        .post('/users/register')
        .send(newUser)

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'User created successfully');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('username', newUser.username);
      expect(res.body).to.have.property('token');
      // Save the JWT token for later use in note tests
      authToken = res.body.token;
    });

    it('It should error as user already exists', async () => {
      const newUser = {
        username: 'testuser',
        password: 'testpassword',
      };

      let res =  await chai.request(endpoint)
        .post('/users/register')
        .send(newUser)

      expect(res).to.have.status(409);
      expect(res.body).to.have.property('error', 'User with this username already exists');
    });

    it('should login an existing user', async () => {
      const userCredentials = {
        username: 'testuser',
        password: 'testpassword',
      };

      let res =  await chai.request(endpoint)
        .post('/users/login')
        .send(userCredentials)

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Authentication successful');
      expect(res.body).to.have.property('token');
    });

    it('should return 401 for invalid login credentials', async () => {
      const invalidCredentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      let res = await chai.request(endpoint)
        .post('/users/login')
        .send(invalidCredentials)

        expect(res).to.have.status(401);
    });
  });

  describe('Note CRUD API', () => {
    describe('CRUD Operations', () => {
      //Use authToken stored in User API

      it('should create a new note', async () => {
        const res = await chai.request(endpoint)
          .post('/notes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Note',
            content: 'This is a test note content.',
            type: 'personal',
          });

        expect(res).to.have.status(200);
        expect(res.body).to.have.property('title').equal('Test Note');
        expect(res.body).to.have.property('content').equal('This is a test note content.');
        expect(res.body).to.have.property('type').equal('personal');
        expect(res.body).to.have.property('id')
      });

      it('should retrieve all notes', async () => {
        const res = await chai.request(endpoint)
          .get('/notes')
          .set('Authorization', `Bearer ${authToken}`);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(1);
      });

      it('should update a note', async () => {
        const createRes = await chai.request(endpoint)
          .post('/notes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Note to be updated',
            content: 'This is a note to be updated.',
            type: 'work',
          });

        const noteId = createRes.body.id;

        const updateRes = await chai.request(endpoint)
          .put(`/notes/${noteId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Updated Note',
            content: 'This note has been updated.',
          });

        expect(updateRes).to.have.status(200);
        expect(updateRes.body).to.have.property('title').equal('Updated Note');
        expect(updateRes.body).to.have.property('content').equal('This note has been updated.');
        expect(updateRes.body).to.have.property('type').equal('work');
      });

      it('should delete a note', async () => {
        const createRes = await chai.request(endpoint)
          .post(`/notes`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Note to be deleted',
            content: 'This is a note to be deleted.',
            type: 'personal',
          });

        const noteId = createRes.body.id;

        const deleteRes = await chai.request(endpoint)
          .delete(`/notes/${noteId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(deleteRes).to.have.status(200);
        expect(deleteRes.body).to.have.property('message').equal('Note deleted successfully');
      });
    });
  });
})

