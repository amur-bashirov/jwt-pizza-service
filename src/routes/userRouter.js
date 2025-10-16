const express = require('express');
const { asyncHandler } = require('../endpointHelper.js');
const { DB, Role } = require('../database/database.js');
const { authRouter, setAuth } = require('./authRouter.js');

const userRouter = express.Router();

userRouter.docs = [
  {
    method: 'GET',
    path: '/api/user?page=1&limit=10&name=*',
    requiresAuth: true,
    description: 'Gets a list of users',
    example: `curl -X GET localhost:3000/api/user -H 'Authorization: Bearer tttttt'`,
    response: {
      users: [
        {
          id: 1,
          name: '常用名字',
          email: 'a@jwt.com',
          roles: [{ role: 'admin' }],
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/api/user/me',
    requiresAuth: true,
    description: 'Get authenticated user',
    example: `curl -X GET localhost:3000/api/user/me -H 'Authorization: Bearer tttttt'`,
    response: { id: 1, name: '常用名字', email: 'a@jwt.com', roles: [{ role: 'admin' }] },
  },
  {
  method: 'DELETE',
  path: '/api/user/:userId',
  requiresAuth: true,
  description: 'Delete a user by their ID',
  example: `curl -X DELETE localhost:3000/api/user/1 -H 'Authorization: Bearer tttttt'`,
  requestBody: {},
  response: { message: 'user deleted' },
},
  {
    method: 'PUT',
    path: '/api/user/:userId',
    requiresAuth: true,
    description: 'Update user',
    example: `curl -X PUT localhost:3000/api/user/1 -d '{"name":"常用名字", "email":"a@jwt.com", "password":"admin"}' -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt'`,
    response: { user: { id: 1, name: '常用名字', email: 'a@jwt.com', roles: [{ role: 'admin' }] }, token: 'tttttt' },
  },
];

// getUser
userRouter.get(
  '/me',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  })
);

// listUsers
userRouter.get(
  '/',
  authRouter.authenticateToken, // ensure authentication
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.name || '*';

    const [users, more] = await DB.getUsers(req.user, page, limit, name);
    res.json({ users, more });
  })
);


userRouter.delete(
  '/:userId',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);

    console.log('🧾 DELETE request for userId:', userId);
    console.log('🔐 Authenticated user object:', req.user);

    // Log what roles the user has
    if (req.user.roles) {
      console.log('👑 User roles array:', req.user.roles);
    } else {
      console.log('⚠️ No roles field found on req.user');
    }

    // If user has isRole method, show what it returns for Admin
    if (typeof req.user.isRole === 'function') {
      console.log('🔍 isRole(Admin):', req.user.isRole(Role.Admin));
    }

    // Authorization check
    if (req.user.id !== userId && !req.user.isRole?.(Role.Admin)) {
      console.log('🚫 Authorization failed — not admin or self-deleting.');
      return res.status(403).json({ message: 'unauthorized' });
    }

    console.log('✅ Authorization passed — proceeding to delete user...');
    await DB.deleteUser(userId);

    console.log('🗑️ User deleted successfully.');
    res.json({ message: 'user deleted' });
  })
);



// updateUser
userRouter.put(
  '/:userId',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const userId = Number(req.params.userId);
    const user = req.user;
    if (user.id !== userId && !user.isRole(Role.Admin)) {
      return res.status(403).json({ message: 'unauthorized' });
    }

    const updatedUser = await DB.updateUser(userId, name, email, password);
    const auth = await setAuth(updatedUser);
    res.json({ user: updatedUser, token: auth });
  })
);

module.exports = userRouter;
