import cors from "cors";
import dotenv from 'dotenv';
import express from 'express';
import { exportDB, listBackup } from "./config/db";
import { saveHolidayJson } from "./config/holidays";
import AngsuranController from './controllers/AngsuranController';
import AreaController from './controllers/AreaController';
import AuthController from './controllers/AuthController';
import CategoryController from "./controllers/CategoryController";
import EmployeController from './controllers/EmployeController';
import GroupController from './controllers/GroupController';
import LoanController from './controllers/LoanController';
import MemberController from './controllers/MemberController';
import PosController from './controllers/PosController';
import PosisiUsahaController from "./controllers/PosisiUsahaController";
import ScheduleController from './controllers/ScheduleController';
import TransactionController from "./controllers/TransactionController";
import UserController from './controllers/UserController';
import authenticate from './middleware/authenticate';
import verifySecret from './middleware/verifySecret';
import LogActivityController from "./controllers/LogActivityController";
const multer = require('multer');
const path = require('path');


dotenv.config();
// const express = require('express');
const app = express();
const port = import.meta.env.VITE_APP_PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Keep login public
app.post('/api/login', AuthController.login);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// create router and apply verifySecret to all controller routes
const apiRouter = express.Router();
apiRouter.use(verifySecret);
apiRouter.use(authenticate);

// autentikasi
apiRouter.get('/user', AuthController.getUser);
apiRouter.put('/profile-update/:id', AuthController.updateUserProfil);

// pengguna
apiRouter.get('/users', UserController.index);
apiRouter.post('/users', UserController.store);
apiRouter.get('/users/:id', UserController.show);
apiRouter.put('/users/:id', UserController.update);
apiRouter.delete('/users/:id', UserController.delete);

// karyawan
apiRouter.get('/employees', EmployeController.index);
apiRouter.get('/employees/count', EmployeController.count);
apiRouter.get('/employees/getNip', EmployeController.generateNip);
apiRouter.get('/employees/checkNip', EmployeController.checkNip);
apiRouter.post('/employees', EmployeController.store);
apiRouter.get('/employees/:id', EmployeController.show);
apiRouter.put('/employees/:id', EmployeController.update);
apiRouter.delete('/employees/:id', EmployeController.delete);

// area
apiRouter.get('/areas', AreaController.index);
apiRouter.get('/areas/count', AreaController.count);
apiRouter.post('/areas', AreaController.store);
apiRouter.get('/areas/:id', AreaController.show);
apiRouter.put('/areas/:id', AreaController.update);
apiRouter.delete('/areas/:id', AreaController.delete);

// Group
apiRouter.get('/groups', GroupController.index);
apiRouter.get('/groups/count', GroupController.count);
apiRouter.post('/groups', GroupController.store);
apiRouter.get('/groups/:id', GroupController.show);
apiRouter.put('/groups/:id', GroupController.update);
apiRouter.delete('/groups/:id', GroupController.delete);

// Pos
apiRouter.get('/pos', PosController.index);
apiRouter.get('/pos/count', PosController.count);
apiRouter.post('/pos', PosController.store);
apiRouter.get('/pos/:id', PosController.show);
apiRouter.put('/pos/:id', PosController.update);
apiRouter.delete('/pos/:id', PosController.delete);

apiRouter.get('/categories', CategoryController.index);
apiRouter.get('/categories/count', CategoryController.count);
apiRouter.post('/categories', CategoryController.store);
apiRouter.get('/categories/:id', CategoryController.show);
apiRouter.put('/categories/:id', CategoryController.update);
apiRouter.delete('/categories/:id', CategoryController.delete);

// Members
apiRouter.get('/members', MemberController.index);
apiRouter.get('/members/:nik/nik-check', MemberController.nixExist);
apiRouter.get('/members/:no_kk/nokk-check', MemberController.nokkExist);
apiRouter.get('/members/count', MemberController.count);
apiRouter.post('/members', MemberController.store);
apiRouter.get('/members/:id', MemberController.show);
apiRouter.put('/members/:id', MemberController.update);
apiRouter.delete('/members/:id', MemberController.delete);

// Schedule
apiRouter.get('/schedule', ScheduleController.index);
apiRouter.post('/schedule', ScheduleController.store);
apiRouter.get('/schedule/:id', ScheduleController.show);
apiRouter.put('/schedule/:id', ScheduleController.update);
apiRouter.delete('/schedule/:id', ScheduleController.delete);


// loans
apiRouter.get('/loans', LoanController.index);
apiRouter.post('/loans', LoanController.store);
apiRouter.get('/loans/:id', LoanController.show);
apiRouter.get('/loans/:id/status-pinjaman', LoanController.pinjamanAnggotaStatus);
apiRouter.get('/loans/:id/code', LoanController.getCode);
apiRouter.put('/loans/:id', LoanController.update);
apiRouter.delete('/loans/:id', LoanController.delete);

apiRouter.get('/angsuran/:id', AngsuranController.index);
apiRouter.post('/angsuran/:idPinjaman', AngsuranController.store);
apiRouter.put('/angsuran/:id', AngsuranController.update);
apiRouter.put('/delete-angsuran/:id', AngsuranController.delete);
apiRouter.get('/angsuran/aktif/:id', AngsuranController.lastAngsuran);

apiRouter.get('/transactions', TransactionController.index);
apiRouter.get('/laba-rugi', TransactionController.labaRugi);
apiRouter.post('/transactions', TransactionController.store);
apiRouter.get('/transactions/:id', TransactionController.show);
apiRouter.put('/transactions/:id', TransactionController.update);
apiRouter.delete('/transactions/:id', TransactionController.delete);
apiRouter.get('/getGroupsTransaction', TransactionController.getGroupTransaction);

apiRouter.get('/configLoan', (req, res) => {
    const totalBulan = process.env.VITE_APP_BULAN || 10;
    const modalDo = process.env.VITE_APP_MODAL_DO || 13;
    return res.json({ config: { totalBulan, modalDo } })
});

apiRouter.post('/export-db', async (req, res) => {
    exportDB();
    await saveHolidayJson();
    return res.json({ message: "Berhasil export db" })
});
apiRouter.get('/list-backup', async (req, res) => {
    return res.json({ backups: listBackup() })
});

apiRouter.post("/posisi-usaha/save", PosisiUsahaController.savePosisiUsaha)
apiRouter.put("/posisi-usaha/save/:id", PosisiUsahaController.savePosisiUsaha)
apiRouter.get("/posisi-usaha/data-minggu-lalu", PosisiUsahaController.getDataMingguLalu)
apiRouter.get("/posisi-usaha/data-this-week", PosisiUsahaController.getDataThisWeek)
apiRouter.get("/posisi-usaha-today", PosisiUsahaController.getPosisiUsahaToday)
apiRouter.get("/posisi-usaha", PosisiUsahaController.getPosisiUsaha)
apiRouter.get("/posisi-usaha/:id", PosisiUsahaController.getPosisiUsahaById)
apiRouter.delete("/posisi-usaha/:id", PosisiUsahaController.deletePosisiUsaha)

apiRouter.get("/activity", LogActivityController.index)
apiRouter.get("/listMenu", LogActivityController.getMenu)

// konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// endpoint upload
app.post('/upload', upload.single('photo'), (req, res) => {
  res.json({
    message: 'Upload berhasil',
    file: req.file,
    imageUrl: `http://localhost:${port}/uploads/${req.file.filename}`,
  });
});

app.use('/api', apiRouter);
app.listen(port, async () => {

    console.log(`Server running at http://localhost:${port}`);
});
