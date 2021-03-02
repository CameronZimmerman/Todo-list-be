require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'gar@field.com',
          password: 'lasagna'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('creates todo for specific user', async() => {

      const newTodo = {
        'todo': 'eat lasagna',
        'complete': false
      };
      const expectation = [
        {
          ...newTodo,
          'id': 4,
          'user_id': 2
        },
      ];

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect([data.body]).toEqual(expectation);
    });

    test('get todos for specific user', async() => {

      const expectation = [
        {
          'todo': 'eat lasagna',
          'complete': false,
          'id': 4,
          'user_id': 2
        },
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('update todo for specific user by id', async() => {

      const expectation = 
        {
          'todo': 'eat lasagna',
          'complete': true,
          'id': 4,
          'user_id': 2
        };

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .send({ id: 4 })
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
