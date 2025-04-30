import express from 'express';
import UserController  from './controllers/UserController';
import cors  from "cors"
import AuthController from './controllers/AuthController';
import EmployeController from './controllers/EmployeController';
import AreaController from './controllers/AreaController';
import GroupController from './controllers/GroupController';
// const express = require('express');
const app = express();
const port = import.meta.env.VITE_APP_PORT;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const secret = req.headers['x-app-secret'];
    if (secret === import.meta.env.VITE_APP_SECRET) {
      return next();
    }
    return res.status(403).send("Forbidden");
  });

//autentikasi
app.post('/api/login', AuthController.login);
app.get('/api/user', AuthController.getUser);

// pengguna
app.get('/api/users', UserController.index);
app.post('/api/users', UserController.store);
app.get('/api/users/:id', UserController.show);
app.put('/api/users/:id', UserController.update);
app.delete('/api/users/:id', UserController.delete);

// karyawan
app.get('/api/employees', EmployeController.index);
app.post('/api/employees', EmployeController.store);
app.get('/api/employees/:id', EmployeController.show);
app.put('/api/employees/:id', EmployeController.update);
app.delete('/api/employees/:id', EmployeController.delete);

// area
app.get('/api/areas', AreaController.index);
app.post('/api/areas', AreaController.store);
app.get('/api/areas/:id', AreaController.show);
app.put('/api/areas/:id', AreaController.update);
app.delete('/api/areas/:id', AreaController.delete);

// Group
app.get('/api/groups', GroupController.index);
app.post('/api/groups', GroupController.store);
app.get('/api/groups/:id', GroupController.show);
app.put('/api/groups/:id', GroupController.update);
app.delete('/api/groups/:id', GroupController.delete);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
