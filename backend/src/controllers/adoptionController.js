/**
 * Adoption System Controller
 * Manages adoption applications, multi-stage approval workflow, agreements, and certificate generation
 */

const db = require('../config/db');
const { generateApplicationCode, generateCertificateCode } = require('../utils/security');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  // Submit Application (Public or Logged-in user)
  async applyForAdoption(req, res) {
    try {
      const {
        pet_id, applicant_name, mobile_number, email, address,
        city, occupation, family_members, home_type,
        previous_pet_experience, reason_for_adoption,
        preferred_pet, additional_information
      } = req.body;

      if (!pet_id || !applicant_name || !mobile_number || !email || !address || !city || !reason_for_adoption) {
        return res.status(400).json({
          success: false,
          message: 'Pet ID, full name, phone number, email address, physical address, city, and reason for adoption are required.'
        });
      }

      const [pets] = await db.query('SELECT id, name, pet_code, adoption_status FROM pets WHERE id = ?', [pet_id]);
      if (!pets || pets.length === 0) {
        return res.status(404).json({ success: false, message: 'Selected pet not found.' });
      }

      if (['Adopted', 'Not Available'].includes(pets[0].adoption_status)) {
        return res.status(400).json({
          success: false,
          message: `This pet is currently marked as ${pets[0].adoption_status} and cannot accept new applications.`
        });
      }

      // Generate unique Application Code: APP-YYYY-XXXXX
      const [countResult] = await db.query('SELECT COUNT(*) as count FROM adoption_applications');
      const nextNum = (countResult[0]?.count || 0) + 1;
      const appCode = generateApplicationCode(nextNum);

      const userId = req.user ? req.user.id : null;

      const [result] = await db.query(
        `INSERT INTO adoption_applications (
          application_code, pet_id, user_id, applicant_name, mobile_number,
          email, address, city, occupation, family_members, home_type,
          previous_pet_experience, reason_for_adoption, preferred_pet,
          additional_information, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW())`,
        [
          appCode, pet_id, userId, applicant_name.trim(), mobile_number.trim(),
          email.trim(), address.trim(), city.trim(), occupation ? occupation.trim() : 'Not Specified',
          family_members ? parseInt(family_members, 10) : 1, home_type || 'Apartment',
          previous_pet_experience || null, reason_for_adoption.trim(),
          preferred_pet || `${pets[0].name} (${pets[0].pet_code})`,
          additional_information || null
        ]
      );

      // Update pet status to Application Pending if it was Available
      if (pets[0].adoption_status === 'Available') {
        await db.query("UPDATE pets SET adoption_status = 'Application Pending' WHERE id = ?", [pet_id]);
      }

      // Create Admin notification
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, related_entity, related_id, is_read, created_at)
         VALUES (NULL, 'New Adoption Application Received', ?, 'ADOPTION_APPLICATION', 'adoption_applications', ?, 0, NOW())`,
        [`${applicant_name} submitted application ${appCode} for ${pets[0].name} (${pets[0].pet_code}).`, result.insertId]
      );

      await logActivity(userId, applicant_name, 'SUBMIT_ADOPTION_APPLICATION', `Submitted application ${appCode} for pet ${pets[0].name}`, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Your adoption application has been submitted successfully and is under shelter review.',
        data: {
          id: result.insertId,
          application_code: appCode,
          pet_name: pets[0].name
        }
      });
    } catch (err) {
      console.error('ApplyForAdoption error:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit adoption application' });
    }
  },

  // User: View My Applications
  async getMyApplications(req, res) {
    try {
      const [rows] = await db.query(
        `SELECT a.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed, p.primary_photo_url
         FROM adoption_applications a
         INNER JOIN pets p ON p.id = a.pet_id
         WHERE a.user_id = ? OR a.email = ?
         ORDER BY a.id DESC`,
        [req.user.id, req.user.email || '']
      );

      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('GetMyApplications error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve your applications' });
    }
  },

  // Staff / Admin: List All Applications
  async getAllApplications(req, res) {
    try {
      const { status, pet_id, search } = req.query;
      let sql = `SELECT a.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed, p.primary_photo_url,
                        u.name as reviewer_name
                 FROM adoption_applications a
                 INNER JOIN pets p ON p.id = a.pet_id
                 LEFT JOIN users u ON u.id = a.reviewed_by
                 WHERE 1=1`;
      const params = [];

      if (status && status !== 'All') {
        sql += ` AND a.status = ?`;
        params.push(status);
      }
      if (pet_id) {
        sql += ` AND a.pet_id = ?`;
        params.push(pet_id);
      }
      if (search) {
        sql += ` AND (a.applicant_name LIKE ? OR a.application_code LIKE ? OR a.email LIKE ? OR a.city LIKE ? OR p.name LIKE ?)`;
        const kw = `%${search}%`;
        params.push(kw, kw, kw, kw, kw);
      }

      sql += ` ORDER BY a.id DESC`;

      const [rows] = await db.query(sql, params);
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('GetAllApplications error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve applications' });
    }
  },

  // Get Single Application Details
  async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await db.query(
        `SELECT a.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed, p.primary_photo_url, p.adoption_status as pet_adoption_status,
                u.name as reviewer_name
         FROM adoption_applications a
         INNER JOIN pets p ON p.id = a.pet_id
         LEFT JOIN users u ON u.id = a.reviewed_by
         WHERE a.id = ?`,
        [id]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const application = rows[0];

      // If user is a regular user, verify ownership
      if (req.user.role === 'USER' && application.user_id !== req.user.id && application.email !== req.user.email) {
        return res.status(403).json({ success: false, message: 'You are only authorized to view your own applications.' });
      }

      // Fetch attached visits
      const [visits] = await db.query('SELECT * FROM visits WHERE application_id = ? ORDER BY visit_date ASC', [id]);
      application.visits = visits;

      // Fetch adoption record if approved
      const [adoptionRecords] = await db.query('SELECT * FROM adoption_records WHERE application_id = ?', [id]);
      application.adoption_record = adoptionRecords[0] || null;

      return res.status(200).json({ success: true, data: application });
    } catch (err) {
      console.error('GetApplicationById error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch application' });
    }
  },

  // Update Status Transition
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_remarks } = req.body;

      const validStatuses = ['PENDING', 'UNDER REVIEW', 'VISIT SCHEDULED', 'VISIT COMPLETED', 'APPROVED', 'REJECTED', 'ADOPTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status (${status}). Allowed statuses: ${validStatuses.join(', ')}` });
      }

      const [existing] = await db.query('SELECT * FROM adoption_applications WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      await db.query(
        `UPDATE adoption_applications SET
          status = ?,
          admin_remarks = COALESCE(?, admin_remarks),
          reviewed_by = ?,
          reviewed_at = NOW()
         WHERE id = ?`,
        [status, admin_remarks || null, req.user.id, id]
      );

      // If transitioning to VISIT SCHEDULED, update pet status
      if (status === 'VISIT SCHEDULED') {
        await db.query("UPDATE pets SET adoption_status = 'Visit Scheduled' WHERE id = ?", [existing[0].pet_id]);
      } else if (status === 'REJECTED') {
        // If rejected, check if there are other pending apps; if none, revert pet to Available
        const [otherApps] = await db.query(
          "SELECT id FROM adoption_applications WHERE pet_id = ? AND id != ? AND status IN ('PENDING', 'UNDER REVIEW', 'VISIT SCHEDULED')",
          [existing[0].pet_id, id]
        );
        if (!otherApps || otherApps.length === 0) {
          await db.query("UPDATE pets SET adoption_status = 'Available' WHERE id = ?", [existing[0].pet_id]);
        }
      }

      await logActivity(req.user.id, req.user.username, 'UPDATE_APPLICATION_STATUS', `Application ${existing[0].application_code} status changed to ${status}`, req.ip);

      return res.status(200).json({
        success: true,
        message: `Application status updated to ${status}.`
      });
    } catch (err) {
      console.error('UpdateStatus error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update application status' });
    }
  },

  // Final Adoption Approval & Certificate Generation
  async approveAdoption(req, res) {
    try {
      const { id } = req.params;
      const { admin_remarks, agreement_text, adoption_date } = req.body;

      const [apps] = await db.query('SELECT a.*, p.name as pet_name, p.pet_code FROM adoption_applications a INNER JOIN pets p ON p.id = a.pet_id WHERE a.id = ?', [id]);
      if (!apps || apps.length === 0) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const app = apps[0];

      // Update application to ADOPTED
      await db.query(
        "UPDATE adoption_applications SET status = 'ADOPTED', admin_remarks = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
        [admin_remarks || 'Approved and finalized for adoption.', req.user.id, id]
      );

      // Update pet status to ADOPTED
      await db.query("UPDATE pets SET adoption_status = 'Adopted' WHERE id = ?", [app.pet_id]);

      // Generate unique Certificate Code: CERT-YYYY-XXXXX
      const [certCount] = await db.query('SELECT COUNT(*) as count FROM adoption_records');
      const nextNum = (certCount[0]?.count || 0) + 1;
      const certCode = generateCertificateCode(nextNum);

      const finalAdoptionDate = adoption_date || new Date().toISOString().split('T')[0];
      const defaultAgreement = agreement_text ||
        `I, ${app.applicant_name}, take full legal and compassionate custody of ${app.pet_name} (${app.pet_code}). I vow to provide humane shelter, adequate nourishment, regular medical care, and never to abandon or exploit this companion animal.`;

      // Insert into adoption_records
      const [recordResult] = await db.query(
        `INSERT INTO adoption_records (
          application_id, pet_id, applicant_name, applicant_email, applicant_phone,
          adoption_date, agreement_text, certificate_code, admin_remarks, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          id, app.pet_id, app.applicant_name, app.email, app.mobile_number,
          finalAdoptionDate, defaultAgreement, certCode, admin_remarks || null, req.user.id
        ]
      );

      await logActivity(req.user.id, req.user.username, 'APPROVE_ADOPTION', `Approved adoption of ${app.pet_name} by ${app.applicant_name} (Cert: ${certCode})`, req.ip);

      return res.status(200).json({
        success: true,
        message: `Adoption approved! Pet ${app.pet_name} is now officially Adopted. Certificate issued: ${certCode}.`,
        data: {
          adoption_record_id: recordResult.insertId,
          certificate_code: certCode,
          adoption_date: finalAdoptionDate
        }
      });
    } catch (err) {
      console.error('ApproveAdoption error:', err);
      return res.status(500).json({ success: false, message: 'Failed to approve adoption' });
    }
  },

  // Reject Application
  async rejectAdoption(req, res) {
    try {
      const { id } = req.params;
      const { admin_remarks } = req.body;

      if (!admin_remarks) {
        return res.status(400).json({ success: false, message: 'Rejection reason/remarks are mandatory.' });
      }

      const [apps] = await db.query('SELECT * FROM adoption_applications WHERE id = ?', [id]);
      if (!apps || apps.length === 0) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      await db.query(
        "UPDATE adoption_applications SET status = 'REJECTED', admin_remarks = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
        [admin_remarks, req.user.id, id]
      );

      // Revert pet status to Available if no other active applications
      const [active] = await db.query(
        "SELECT id FROM adoption_applications WHERE pet_id = ? AND id != ? AND status IN ('PENDING', 'UNDER REVIEW', 'VISIT SCHEDULED')",
        [apps[0].pet_id, id]
      );
      if (!active || active.length === 0) {
        await db.query("UPDATE pets SET adoption_status = 'Available' WHERE id = ?", [apps[0].pet_id]);
      }

      await logActivity(req.user.id, req.user.username, 'REJECT_APPLICATION', `Rejected application ${apps[0].application_code}`, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Application marked as REJECTED with feedback logged.'
      });
    } catch (err) {
      console.error('RejectAdoption error:', err);
      return res.status(500).json({ success: false, message: 'Failed to reject application' });
    }
  },

  // Get Adoption Certificate Data for Printing / PDF
  async getCertificate(req, res) {
    try {
      const { id } = req.params;
      const [records] = await db.query(
        `SELECT ar.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed, p.color, p.gender, p.age, p.microchip_number,
                s.shelter_name, s.phone as shelter_phone, s.email as shelter_email, s.address as shelter_address
         FROM adoption_records ar
         INNER JOIN pets p ON p.id = ar.pet_id
         LEFT JOIN settings s ON s.id = 1
         WHERE ar.application_id = ? OR ar.id = ?`,
        [id, id]
      );

      if (!records || records.length === 0) {
        return res.status(404).json({ success: false, message: 'Adoption certificate record not found.' });
      }

      return res.status(200).json({ success: true, data: records[0] });
    } catch (err) {
      console.error('GetCertificate error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve certificate details' });
    }
  }
};
