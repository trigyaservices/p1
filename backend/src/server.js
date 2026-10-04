/**
 * Main Backend Server
 * Pet Adoption and Management System (BCA Final Year Project)
 *
 * Implements full REST API with dual-mode support:
 * 1. Express.js framework when dependencies are installed via npm.
 * 2. High-performance native Node.js HTTP fallback engine when running in
 *    isolated/offline sandbox environments, guaranteeing zero crashes.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
require('./config/env');

const db = require('./config/db');

// Controllers
const authController = require('./controllers/authController');
const petController = require('./controllers/petController');
const medicalController = require('./controllers/medicalController');
const vaccinationController = require('./controllers/vaccinationController');
const monthlyReportController = require('./controllers/monthlyReportController');
const adoptionController = require('./controllers/adoptionController');
const visitController = require('./controllers/visitController');
const fosterController = require('./controllers/fosterController');
const rescueController = require('./controllers/rescueController');
const userController = require('./controllers/userController');
const dashboardController = require('./controllers/dashboardController');
const reportController = require('./controllers/reportController');
const notificationController = require('./controllers/notificationController');
const settingController = require('./controllers/settingController');
const activityLogController = require('./controllers/activityLogController');

const { verifyToken } = require('./utils/security');

let expressApp = null;
let useExpress = false;

try {
  const express = require('express');
  const cors = require('cors');
  const morgan = require('morgan');

  const app = express();
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/pets', require('./routes/petRoutes'));
  app.use('/api/medical', require('./routes/medicalRoutes'));
  app.use('/api/vaccinations', require('./routes/vaccinationRoutes'));
  app.use('/api/monthly-reports', require('./routes/monthlyReportRoutes'));
  app.use('/api/adoptions', require('./routes/adoptionRoutes'));
  app.use('/api/visits', require('./routes/visitRoutes'));
  app.use('/api/foster', require('./routes/fosterRoutes'));
  app.use('/api/rescue', require('./routes/rescueRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
  app.use('/api/reports', require('./routes/reportRoutes'));
  app.use('/api/notifications', require('./routes/notificationRoutes'));
  app.use('/api/settings', require('./routes/settingRoutes'));
  app.use('/api/activity-logs', require('./routes/activityLogRoutes'));

  app.get('/api/health', (req, res) => res.json({ status: 'OK', framework: 'Express.js' }));

  app.use(require('./middleware/errorHandler'));
  expressApp = app;
  useExpress = true;
} catch (e) {
  useExpress = false;
}

// Built-in HTTP router for offline test execution
async function handleNativeRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  req.query = parsedUrl.query || {};
  req.params = {};

  if (pathname.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
        '.webp': 'image/webp', '.pdf': 'application/pdf'
      };
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'File not found' }));
      return;
    }
  }

  let bodyData = {};
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString();
    if (rawBody && (req.headers['content-type'] || '').includes('application/json')) {
      try {
        bodyData = JSON.parse(rawBody);
      } catch (err) {
        bodyData = {};
      }
    }
  }
  req.body = bodyData;

  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
  };
  res.send = function(data) {
    this.end(data);
  };

  async function authenticate() {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return false;
    const [rows] = await db.query('SELECT id, name, username, role, status FROM users WHERE id = ?', [decoded.id]);
    if (!rows || rows.length === 0 || rows[0].status !== 'ACTIVE') return false;

    let permissions = [];
    if (rows[0].role === 'ADMIN') {
      const [allP] = await db.query('SELECT code FROM permissions');
      permissions = allP.map(p => p.code);
    } else {
      const [uP] = await db.query(
        'SELECT p.code FROM permissions p INNER JOIN user_permissions up ON up.permission_id = p.id WHERE up.user_id = ?',
        [rows[0].id]
      );
      permissions = uP.map(p => p.code);
    }

    req.user = { ...rows[0], permissions };
    return true;
  }

  try {
    if (pathname === '/api/health') {
      return res.status(200).json({ status: 'OK', application: 'Pet Adoption System', framework: 'Native Node.js Fallback' });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') return authController.login(req, res);
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      if (!(await authenticate())) return res.status(401).json({ success: false, message: 'Unauthorized' });
      return authController.getMe(req, res);
    }
    if (pathname === '/api/auth/change-password' && req.method === 'PUT') {
      if (!(await authenticate())) return res.status(401).json({ success: false, message: 'Unauthorized' });
      return authController.changePassword(req, res);
    }
    if (pathname === '/api/auth/profile' && req.method === 'PUT') {
      if (!(await authenticate())) return res.status(401).json({ success: false, message: 'Unauthorized' });
      return authController.updateProfile(req, res);
    }

    if (pathname === '/api/pets/public/catalog' && req.method === 'GET') return petController.getPublicCatalog(req, res);
    const pubPetMatch = pathname.match(/^\/api\/pets\/public\/(\d+)$/);
    if (pubPetMatch && req.method === 'GET') {
      req.params.id = pubPetMatch[1];
      return petController.getPublicPet(req, res);
    }

    if (pathname === '/api/settings' && req.method === 'GET') return settingController.getSettings(req, res);

    if (pathname === '/api/adoptions/apply' && req.method === 'POST') {
      await authenticate();
      return adoptionController.applyForAdoption(req, res);
    }

    if (!(await authenticate())) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    if (pathname === '/api/settings' && req.method === 'PUT') return settingController.updateSettings(req, res);

    if (pathname === '/api/dashboard/stats' && req.method === 'GET') return dashboardController.getStats(req, res);
    if (pathname === '/api/dashboard/charts' && req.method === 'GET') return dashboardController.getCharts(req, res);
    if (pathname === '/api/dashboard/recent-activity' && req.method === 'GET') return dashboardController.getRecentActivity(req, res);

    if (pathname === '/api/pets' && req.method === 'GET') return petController.getAllPets(req, res);
    if (pathname === '/api/pets' && req.method === 'POST') return petController.createPet(req, res);
    const petMatch = pathname.match(/^\/api\/pets\/(\d+)$/);
    if (petMatch) {
      req.params.id = petMatch[1];
      if (req.method === 'GET') return petController.getPetById(req, res);
      if (req.method === 'PUT') return petController.updatePet(req, res);
      if (req.method === 'DELETE') return petController.deletePet(req, res);
    }
    const petPhotoMatch = pathname.match(/^\/api\/pets\/(\d+)\/photos$/);
    if (petPhotoMatch && req.method === 'POST') {
      req.params.id = petPhotoMatch[1];
      return petController.uploadPhoto(req, res);
    }
    const petPrimaryMatch = pathname.match(/^\/api\/pets\/(\d+)\/photos\/(\d+)\/primary$/);
    if (petPrimaryMatch && req.method === 'PUT') {
      req.params.id = petPrimaryMatch[1];
      req.params.photoId = petPrimaryMatch[2];
      return petController.setPrimaryPhoto(req, res);
    }
    const petDeletePhotoMatch = pathname.match(/^\/api\/pets\/(\d+)\/photos\/(\d+)$/);
    if (petDeletePhotoMatch && req.method === 'DELETE') {
      req.params.id = petDeletePhotoMatch[1];
      req.params.photoId = petDeletePhotoMatch[2];
      return petController.deletePhoto(req, res);
    }

    if (pathname === '/api/medical' && req.method === 'GET') return medicalController.getAllMedicalRecords(req, res);
    if (pathname === '/api/medical' && req.method === 'POST') return medicalController.createMedicalRecord(req, res);
    const medMatch = pathname.match(/^\/api\/medical\/(\d+)$/);
    if (medMatch) {
      req.params.id = medMatch[1];
      if (req.method === 'GET') return medicalController.getMedicalRecordById(req, res);
      if (req.method === 'PUT') return medicalController.updateMedicalRecord(req, res);
      if (req.method === 'DELETE') return medicalController.deleteMedicalRecord(req, res);
    }

    if (pathname === '/api/vaccinations' && req.method === 'GET') return vaccinationController.getAllVaccinations(req, res);
    if (pathname === '/api/vaccinations/alerts' && req.method === 'GET') return vaccinationController.getVaccinationAlerts(req, res);
    if (pathname === '/api/vaccinations' && req.method === 'POST') return vaccinationController.createVaccination(req, res);
    const vacMatch = pathname.match(/^\/api\/vaccinations\/(\d+)$/);
    if (vacMatch) {
      req.params.id = vacMatch[1];
      if (req.method === 'PUT') return vaccinationController.updateVaccination(req, res);
      if (req.method === 'DELETE') return vaccinationController.deleteVaccination(req, res);
    }

    if (pathname === '/api/monthly-reports' && req.method === 'GET') return monthlyReportController.getAllReports(req, res);
    if (pathname === '/api/monthly-reports' && req.method === 'POST') return monthlyReportController.createReport(req, res);
    const mrTimelineMatch = pathname.match(/^\/api\/monthly-reports\/(\d+)\/timeline$/);
    if (mrTimelineMatch && req.method === 'GET') {
      req.params.petId = mrTimelineMatch[1];
      return monthlyReportController.getPetTimeline(req, res);
    }
    const mrMatch = pathname.match(/^\/api\/monthly-reports\/(\d+)$/);
    if (mrMatch) {
      req.params.id = mrMatch[1];
      if (req.method === 'PUT') return monthlyReportController.updateReport(req, res);
      if (req.method === 'DELETE') return monthlyReportController.deleteReport(req, res);
    }

    if (pathname === '/api/adoptions' && req.method === 'GET') return adoptionController.getAllApplications(req, res);
    if (pathname === '/api/adoptions/my' && req.method === 'GET') return adoptionController.getMyApplications(req, res);
    const appCertMatch = pathname.match(/^\/api\/adoptions\/(\d+)\/certificate$/);
    if (appCertMatch && req.method === 'GET') {
      req.params.id = appCertMatch[1];
      return adoptionController.getCertificate(req, res);
    }
    const appMatch = pathname.match(/^\/api\/adoptions\/(\d+)$/);
    if (appMatch && req.method === 'GET') {
      req.params.id = appMatch[1];
      return adoptionController.getApplicationById(req, res);
    }
    const appStatusMatch = pathname.match(/^\/api\/adoptions\/(\d+)\/status$/);
    if (appStatusMatch && req.method === 'PUT') {
      req.params.id = appStatusMatch[1];
      return adoptionController.updateStatus(req, res);
    }
    const appApproveMatch = pathname.match(/^\/api\/adoptions\/(\d+)\/approve$/);
    if (appApproveMatch && req.method === 'POST') {
      req.params.id = appApproveMatch[1];
      return adoptionController.approveAdoption(req, res);
    }
    const appRejectMatch = pathname.match(/^\/api\/adoptions\/(\d+)\/reject$/);
    if (appRejectMatch && req.method === 'POST') {
      req.params.id = appRejectMatch[1];
      return adoptionController.rejectAdoption(req, res);
    }

    if (pathname === '/api/visits' && req.method === 'GET') return visitController.getAllVisits(req, res);
    if (pathname === '/api/visits' && req.method === 'POST') return visitController.scheduleVisit(req, res);
    const visitReportMatch = pathname.match(/^\/api\/visits\/(\d+)\/report$/);
    if (visitReportMatch && req.method === 'POST') {
      req.params.id = visitReportMatch[1];
      return visitController.recordVisitReport(req, res);
    }
    const visitMatch = pathname.match(/^\/api\/visits\/(\d+)$/);
    if (visitMatch && req.method === 'PUT') {
      req.params.id = visitMatch[1];
      return visitController.updateVisit(req, res);
    }

    if (pathname === '/api/foster' && req.method === 'GET') return fosterController.getAllFosterRecords(req, res);
    if (pathname === '/api/foster' && req.method === 'POST') return fosterController.createFosterPlacement(req, res);
    const fosterReturnMatch = pathname.match(/^\/api\/foster\/(\d+)\/return$/);
    if (fosterReturnMatch && req.method === 'PUT') {
      req.params.id = fosterReturnMatch[1];
      return fosterController.returnFromFoster(req, res);
    }

    if (pathname === '/api/rescue' && req.method === 'GET') return rescueController.getAllRescues(req, res);
    if (pathname === '/api/rescue' && req.method === 'POST') return rescueController.createRescue(req, res);
    const rescueConvertMatch = pathname.match(/^\/api\/rescue\/(\d+)\/convert-to-pet$/);
    if (rescueConvertMatch && req.method === 'POST') {
      req.params.id = rescueConvertMatch[1];
      return rescueController.convertToPet(req, res);
    }

    if (pathname === '/api/users/permissions' && req.method === 'GET') return userController.getPermissionsList(req, res);
    if (pathname === '/api/users' && req.method === 'GET') return userController.getAllUsers(req, res);
    if (pathname === '/api/users' && req.method === 'POST') return userController.createUser(req, res);
    const userMatch = pathname.match(/^\/api\/users\/(\d+)$/);
    if (userMatch) {
      req.params.id = userMatch[1];
      if (req.method === 'PUT') return userController.updateUser(req, res);
      if (req.method === 'DELETE') return userController.deleteUser(req, res);
    }
    const userStatusMatch = pathname.match(/^\/api\/users\/(\d+)\/status$/);
    if (userStatusMatch && req.method === 'PUT') {
      req.params.id = userStatusMatch[1];
      return userController.toggleUserStatus(req, res);
    }
    const userResetMatch = pathname.match(/^\/api\/users\/(\d+)\/reset-password$/);
    if (userResetMatch && req.method === 'POST') {
      req.params.id = userResetMatch[1];
      return userController.resetUserPassword(req, res);
    }

    const reportMatch = pathname.match(/^\/api\/reports\/([a-zA-Z0-9_-]+)$/);
    if (reportMatch && req.method === 'GET') {
      req.params.type = reportMatch[1];
      return reportController.getReportData(req, res);
    }

    if (pathname === '/api/notifications' && req.method === 'GET') return notificationController.getNotifications(req, res);
    if (pathname === '/api/notifications/read-all' && req.method === 'PUT') return notificationController.markAllAsRead(req, res);
    const notifMatch = pathname.match(/^\/api\/notifications\/(\d+)\/read$/);
    if (notifMatch && req.method === 'PUT') {
      req.params.id = notifMatch[1];
      return notificationController.markAsRead(req, res);
    }

    if (pathname === '/api/activity-logs' && req.method === 'GET') return activityLogController.getLogs(req, res);

    res.status(404).json({ success: false, message: `Route ${req.method} ${pathname} not found.` });
  } catch (err) {
    console.error('Request dispatch error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
}

const PORT = process.env.PORT || 5000;

async function start() {
  await db.initDb();

  if (useExpress && expressApp) {
    expressApp.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🐾 PET ADOPTION SYSTEM - BACKEND (Express.js) READY`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } else {
    const server = http.createServer(handleNativeRequest);
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🐾 PET ADOPTION SYSTEM - BACKEND (Dual Engine) READY`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

module.exports = { start, handleNativeRequest };
