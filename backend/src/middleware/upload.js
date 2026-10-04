/**
 * File Upload Middleware
 * Supports Multer for disk storage with file-type validation and size controls
 */

const path = require('path');
const fs = require('fs');

let multer;
try {
  multer = require('multer');
} catch (e) {
  multer = null;
}

const uploadsDir = path.join(__dirname, '../../uploads');

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Ensure default folders
['pets', 'medical', 'vaccines', 'reports', 'rescue'].forEach(sub => {
  ensureDirectoryExists(path.join(uploadsDir, sub));
});

function getUploader(subfolder = 'pets') {
  if (!multer) {
    // Graceful no-op or simulated upload middleware if multer is missing
    return {
      single: (fieldName) => (req, res, next) => {
        // If file was sent as JSON base64 or URL
        if (req.body && req.body.photo_url) {
          req.file = { path: req.body.photo_url, filename: 'remote-image.jpg' };
        }
        next();
      },
      array: (fieldName) => (req, res, next) => next()
    };
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDir = path.join(uploadsDir, subfolder);
      ensureDirectoryExists(targetDir);
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${ext}). Only JPG, PNG, WEBP, and PDF documents are permitted.`), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
}

module.exports = {
  petPhotoUpload: getUploader('pets'),
  medicalDocUpload: getUploader('medical'),
  vaccineCertUpload: getUploader('vaccines'),
  monthlyReportUpload: getUploader('reports'),
  rescuePhotoUpload: getUploader('rescue')
};
