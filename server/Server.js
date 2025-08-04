import cors from "cors";
import dotenv from 'dotenv';
import express from 'express';
import AngsuranController from './controllers/AngsuranController';
import AreaController from './controllers/AreaController';
import AuthController from './controllers/AuthController';
import EmployeController from './controllers/EmployeController';
import GroupController from './controllers/GroupController';
import PosController from './controllers/PosController';
import LoanController from './controllers/LoanController';
import MemberController from './controllers/MemberController';
import ScheduleController from './controllers/ScheduleController';
import UserController from './controllers/UserController';
import { exportDB, listBackup } from "./config/db";
import { getAllHoliday, getHolidayJson, isHoliday, saveHolidayJson } from "./config/holidays";
import CategoryController from "./controllers/CategoryController";


dotenv.config();
// const express = require('express');
const app = express();
const port = import.meta.env.VITE_APP_PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const secret = req.headers['x-app-secret'];
    if ("123412321123" == (import.meta.env.VITE_APP_SECRET || secret)) {
        return next();
    }
    return res.status(403).send("Forbidden");
});

//autentikasi
app.post('/api/login', AuthController.login);
app.get('/api/user', AuthController.getUser);
app.put('/api/profile-update/:id', AuthController.updateUserProfil);

// pengguna
app.get('/api/users', UserController.index);
app.post('/api/users', UserController.store);
app.get('/api/users/:id', UserController.show);
app.put('/api/users/:id', UserController.update);
app.delete('/api/users/:id', UserController.delete);

// karyawan
app.get('/api/employees', EmployeController.index);
app.get('/api/employees/count', EmployeController.count);
app.get('/api/employees/getNip', EmployeController.generateNip);
app.get('/api/employees/checkNip', EmployeController.checkNip);
app.post('/api/employees', EmployeController.store);
app.get('/api/employees/:id', EmployeController.show);
app.put('/api/employees/:id', EmployeController.update);
app.delete('/api/employees/:id', EmployeController.delete);

// area
app.get('/api/areas', AreaController.index);
app.get('/api/areas/count', AreaController.count);
app.post('/api/areas', AreaController.store);
app.get('/api/areas/:id', AreaController.show);
app.put('/api/areas/:id', AreaController.update);
app.delete('/api/areas/:id', AreaController.delete);

// Group
app.get('/api/groups', GroupController.index);
app.get('/api/groups/count', GroupController.count);
app.post('/api/groups', GroupController.store);
app.get('/api/groups/:id', GroupController.show);
app.put('/api/groups/:id', GroupController.update);
app.delete('/api/groups/:id', GroupController.delete);

// Pos
app.get('/api/pos', PosController.index);
app.get('/api/pos/count', PosController.count);
app.post('/api/pos', PosController.store);
app.get('/api/pos/:id', PosController.show);
app.put('/api/pos/:id', PosController.update);
app.delete('/api/pos/:id', PosController.delete);

app.get('/api/categories', CategoryController.index);
app.get('/api/categories/count', CategoryController.count);
app.post('/api/categories', CategoryController.store);
app.get('/api/categories/:id', CategoryController.show);
app.put('/api/categories/:id', CategoryController.update);
app.delete('/api/categories/:id', CategoryController.delete);

// Group
app.get('/api/members', MemberController.index);
app.get('/api/members/:nik/nik-check', MemberController.nixExist);
app.get('/api/members/:no_kk/nokk-check', MemberController.nokkExist);
app.get('/api/members/count', MemberController.count);
app.post('/api/members', MemberController.store);
app.get('/api/members/:id', MemberController.show);
app.put('/api/members/:id', MemberController.update);
app.delete('/api/members/:id', MemberController.delete);

// Schedule
app.get('/api/schedule', ScheduleController.index);
app.post('/api/schedule', ScheduleController.store);
app.get('/api/schedule/:id', ScheduleController.show);
app.put('/api/schedule/:id', ScheduleController.update);
app.delete('/api/schedule/:id', ScheduleController.delete);


// loans
app.get('/api/loans', LoanController.index);
app.post('/api/loans', LoanController.store);
app.get('/api/loans/:id', LoanController.show);
app.get('/api/loans/:id/status-pinjaman', LoanController.pinjamanAnggotaStatus);
app.get('/api/loans/:id/code', LoanController.getCode);
app.put('/api/loans/:id', LoanController.update);
app.delete('/api/loans/:id', LoanController.delete);

app.get('/api/angsuran/:id', AngsuranController.index);
app.post('/api/angsuran/:idPinjaman', AngsuranController.store);
app.put('/api/angsuran/:id', AngsuranController.update);
app.get('/api/angsuran/aktif/:id', AngsuranController.lastAngsuran);

app.get('/api/configLoan', (req, res) => {
    const totalBulan = process.env.VITE_APP_BULAN || 10;
    const modalDo = process.env.VITE_APP_MODAL_DO || 13;
    return res.json({ config: { totalBulan, modalDo } })
});

app.post('/api/export-db', async (req, res) => {
    exportDB();
    await saveHolidayJson();
    return res.json({ message: "Berhasil export db" })
});
app.get('/api/list-backup', async (req, res) => {
    return res.json({ backups: listBackup() })
});


app.listen(port, async () => {

    console.log(`Server running at http://localhost:${port}`);
});
