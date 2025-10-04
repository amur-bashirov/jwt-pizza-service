const { Role, DB } = require('../database/database.js');
const request = require('supertest');
const app = require('../service');

async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  user = await DB.addUser(user);
  return { ...user, password: 'toomanysecrets' };
}

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
  jest.setTimeout(60 * 1000 * 5); // 5 minutes
}




beforeAll(async () => {
  newRegularUser = await {
    name: "pizza diner",
    email: "reg@test.com",
    password: "a",
  };
  regularUser = newRegularUser

  newNewStore = await {
    id: randomName(),
    name: randomName(),
    totalRevenue: 1000,
  };
  newStore = newNewStore

  regularUser.email = randomName() + "@test.com";
  adminUser = await createAdminUser();
  console.log(adminUser);

  newFranchise = {
    name: randomName(),
    admins: [{ email: adminUser.email }],
    stores: [{ id: randomName(), name: randomName(), totalRevenue: 1000 }],
  };

  regUserFranchise = {
    name: randomName(),
    admins: [{ email: regularUser.email }],
    stores: [{ id: randomName(), name: randomName(), totalRevenue: 1000 }],
  };

  const userLoginRes = await request(app).post("/api/auth").send(regularUser);
  const loginRes = await request(app).put("/api/auth").send(adminUser);
  adminAuthToken = loginRes.body.token;
  regularAuthToken = userLoginRes.body.token;
  console.log("Admin Login Res: ", loginRes.body);
  console.log("User Login Res: ", userLoginRes.body);
});

test('create Franchise as admin', async () => {
  const createFranchiseRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${adminAuthToken}`)
    .send(newFranchise);

  expect(createFranchiseRes.status).toBe(200);
  expect(createFranchiseRes.body).toHaveProperty('id');
  expect(createFranchiseRes.body).toHaveProperty('name', newFranchise.name);
  expect(createFranchiseRes.body.admins[0]).toHaveProperty('email', adminUser.email);
});



test('delete Franchise as admin', async () => {
  const deleteFranchiseRes = await request(app)
    .delete('/api/franchise/${newFranchise.id}')
    .set('Authorization', `Bearer ${adminAuthToken}`)

  expect(deleteFranchiseRes.status).toBe(200);
  expect(deleteFranchiseRes.body).toHaveProperty('message', 'franchise deleted');
});


test('create Franchise as auser', async () => {
  const createFranchiseRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${regularAuthToken}`)
    .send(newFranchise);

  expect(createFranchiseRes.status).toBe(403);
});

test('get Franchise', async() => {
    const getFranchiseRes = await request(app)
    .get('/api/franchise?page=0&limit=10&name=*')
    expect(getFranchiseRes.status).toBe(200);
});


test('get user Franchise', async() => {
    const getUserFranRes = await request(app)
    .get('/api/franchise/${regularUser.id}')
    .set('Authorization', `Bearer ${regularAuthToken}`)
    
    expect(getUserFranRes.status).toBe(200);
    expect(Array.isArray(getUserFranRes.body)).toBe(true);

});

test('create store as admin', async () => {
    franchise2 = {
    name: randomName(),
    admins: [{ email: adminUser.email }],
    stores: [{ id: randomName(), name: randomName(), totalRevenue: 1000 }],
  };
  const createFranchiseRes = await request(app)
    .post('/api/franchise')
    .set('Authorization', `Bearer ${adminAuthToken}`)
    .send(franchise2);

  expect(createFranchiseRes.status).toBe(200);
  const franchiseId = createFranchiseRes.body.id;

  
  const createStoreRes = await request(app)
    .post(`/api/franchise/${franchiseId}/store`)
    .set('Authorization', `Bearer ${adminAuthToken}`)
    .send(newStore);

  console.log('Create Store Response:', createStoreRes.status, createStoreRes.body);

  expect(createStoreRes.status).toBe(200);
  expect(createStoreRes.body).toHaveProperty('id');
  expect(createStoreRes.body).toHaveProperty('name', newStore.name);
});








