const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');
const jwt = require('jsonwebtoken');


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





test('delete own user should succeed', async () => {
  // Create a fresh user to delete
  const [user, token] = await registerUser(request(app));

  // Delete the same user
  const deleteRes = await request(app)
    .delete(`/api/user/${user.id}`)
    .set('Authorization', `Bearer ${token}`);

  expect(deleteRes.status).toBe(200);
  expect(deleteRes.body).toHaveProperty('message', 'user deleted');

  // Try to access /me again with the same token → should fail (unauthorized)
  const meRes = await request(app)
    .get('/api/user/me')
    .set('Authorization', `Bearer ${token}`);

  expect([401, 403]).toContain(meRes.status);
});

test('delete another user as non-admin should fail with 403', async () => {
  // Register two users
  const [userA, tokenA] = await registerUser(request(app));
  const [userB] = await registerUser(request(app));

  // User A tries to delete user B
  const deleteRes = await request(app)
    .delete(`/api/user/${userB.id}`)
    .set('Authorization', `Bearer ${tokenA}`);

  expect(deleteRes.status).toBe(403);
  expect(deleteRes.body).toHaveProperty('message', 'unauthorized');
});










test('list users as authenticated user should return paginated result', async () => {
  // Register an authenticated user
  const [user, token] = await registerUser(request(app));

  // Create a few other users
  await registerUser(request(app));
  await registerUser(request(app));
  await registerUser(request(app));

  // Request first page (page=0 since handler defaults to 0)
  const listRes = await request(app)
    .get('/api/user?page=0&limit=2')
    .set('Authorization', `Bearer ${token}`);

  expect(listRes.status).toBe(200);
  expect(listRes.body).toHaveProperty('users');
  expect(Array.isArray(listRes.body.users)).toBe(true);
  expect(listRes.body).toHaveProperty('more');

  // Try filter by name
  const nameToFind = user.name.slice(0, 3); // partial match
  const filterRes = await request(app)
    .get(`/api/user?name=${encodeURIComponent(nameToFind)}`)
    .set('Authorization', `Bearer ${token}`);

  expect(filterRes.status).toBe(200);
  expect(filterRes.body).toHaveProperty('users');
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





async function createTestUser() {
  const user = {
    name: randomName(),
    email: randomName() + '@test.com',
    password: 'password123'
  };
  await request(app).post('/api/auth').send(user);
  return user;
}







function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}