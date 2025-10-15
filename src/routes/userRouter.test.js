const request = require('supertest');
const app = require('../service');


const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;


beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
});

test('update user', async () => {
  // First, get the current authenticated user (so we know their ID)
  const getMeRes = await request(app)
    .get('/api/user/me')
    .set('Authorization', `Bearer ${testUserAuthToken}`);

  expect(getMeRes.status).toBe(200);
  const userId = getMeRes.body.id;

  
  const updatedData = {
    name: 'Updated Name',
    email: Math.random().toString(36).substring(2, 12) + '@updated.com',
    password: 'newpassword',
  };

  
  const updateRes = await request(app)
    .put(`/api/user/${userId}`)
    .set('Authorization', `Bearer ${testUserAuthToken}`)
    .send(updatedData);

  expect(updateRes.status).toBe(200);

  
  expect(updateRes.body).toHaveProperty('user');
  expect(updateRes.body.user).toHaveProperty('id', userId);
  expect(updateRes.body.user).toHaveProperty('name', updatedData.name);
  expect(updateRes.body.user).toHaveProperty('email', updatedData.email);

  expect(updateRes.body).toHaveProperty('token');
  expectValidJwt(updateRes.body.token);
});

test('update another user as non-admin should fail with 403', async () => {
  
  const otherUser = {
    name: 'Other User',
    email: Math.random().toString(36).substring(2, 12) + '@test.com',
    password: 'password123',
  };
  const otherUserRes = await request(app).post('/api/auth').send(otherUser);
  const otherUserId = otherUserRes.body.user.id;

  
  const updateRes = await request(app)
    .put(`/api/user/${otherUserId}`)
    .set('Authorization', `Bearer ${testUserAuthToken}`)
    .send({
      name: 'Hacker Name',
      email: 'hacker@test.com',
      password: 'hacked',
    });

  
  expect(updateRes.status).toBe(403);
  expect(updateRes.body).toHaveProperty('message', 'unauthorized');
});

test('list users unauthorized', async () => {
  const listUsersRes = await request(app).get('/api/user');
  expect(listUsersRes.status).toBe(401);
});



test('list users with pagination', async () => {
  const [user, userToken] = await registerUser(request(app));

  const res = await request(app)
    .get('/api/user?page=1&limit=2')
    .set('Authorization', 'Bearer ' + userToken);

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('users');
  expect(Array.isArray(res.body.users)).toBe(true);
  expect(res.body).toHaveProperty('page', 1);
  expect(res.body).toHaveProperty('limit', 2);
  expect(res.body).toHaveProperty('total');
  expect(res.body).toHaveProperty('totalPages');
});



async function registerUser(service) {
  const testUser = {
    name: 'pizza diner',
    email: `${randomName()}@test.com`,
    password: 'a',
  };
  const registerRes = await service.post('/api/auth').send(testUser);
  registerRes.body.user.password = testUser.password;

  return [registerRes.body.user, registerRes.body.token];
}

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}






function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}