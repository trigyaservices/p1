/**
 * Visit Management Controller
 * Handles scheduling of applicant-pet interactions, staff assignment, and post-visit reports
 */

const db = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  async getAllVisits(req, res) {
    try {
      const { status, date, pet_id, staff_id } = req.query;
      let sql = `SELECT v.*,
                        p.name as pet_name, p.pet_code, p.animal_type, p.breed, p.primary_photo_url,
                        a.applicant_name, a.mobile_number as applicant_phone, a.email as applicant_email,
                        u.name as staff_name
                 FROM visits v
                 INNER JOIN pets p ON p.id = v.pet_id
                 INNER JOIN adoption_applications a ON a.id = v.application_id
                 LEFT JOIN users u ON u.id = v.assigned_staff_id
                 WHERE 1=1`;
      const params = [];

      if (status && status !== 'All') {
        sql += ` AND v.status = ?`;
        params.push(status);
      }
      if (date) {
        sql += ` AND v.visit_date = ?`;
        params.push(date);
      }
      if (pet_id) {
        sql += ` AND v.pet_id = ?`;
        params.push(pet_id);
      }
      if (staff_id) {
        sql += ` AND v.assigned_staff_id = ?`;
        params.push(staff_id);
      }

      sql += ` ORDER BY v.visit_date ASC, v.visit_time ASC`;

      const [rows] = await db.query(sql, params);
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('GetAllVisits error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve visits' });
    }
  },

  async scheduleVisit(req, res) {
    try {
      const { application_id, pet_id, assigned_staff_id, visit_date, visit_time, location, notes } = req.body;

      if (!application_id || !pet_id || !visit_date || !visit_time) {
        return res.status(400).json({
          success: false,
          message: 'Application ID, Pet ID, visit date, and visit time are mandatory.'
        });
      }

      const [apps] = await db.query('SELECT applicant_name FROM adoption_applications WHERE id = ?', [application_id]);
      const [pets] = await db.query('SELECT name, pet_code FROM pets WHERE id = ?', [pet_id]);

      if (!apps.length || !pets.length) {
        return res.status(404).json({ success: false, message: 'Application or Pet not found.' });
      }

      const [result] = await db.query(
        `INSERT INTO visits (application_id, pet_id, assigned_staff_id, visit_date, visit_time, location, status, notes, visit_result, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED', ?, 'Pending', ?, NOW())`,
        [
          application_id, pet_id, assigned_staff_id ? parseInt(assigned_staff_id, 10) : null,
          visit_date, visit_time, location || 'Main Shelter Courtyard',
          notes || null, req.user.id
        ]
      );

      // Advance application status to VISIT SCHEDULED
      await db.query("UPDATE adoption_applications SET status = 'VISIT SCHEDULED' WHERE id = ?", [application_id]);
      await db.query("UPDATE pets SET adoption_status = 'Visit Scheduled' WHERE id = ?", [pet_id]);

      // Create notification
      const todayStr = new Date().toISOString().split('T')[0];
      if (visit_date === todayStr) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type, related_entity, related_id, is_read, created_at)
           VALUES (NULL, 'Adoption Visit Scheduled Today', ?, 'VISIT_TODAY', 'visits', ?, 0, NOW())`,
          [`Visit scheduled today at ${visit_time} with ${apps[0].applicant_name} for ${pets[0].name}.`, result.insertId]
        );
      }

      await logActivity(req.user.id, req.user.username, 'SCHEDULE_VISIT', `Scheduled visit on ${visit_date} for ${apps[0].applicant_name} with ${pets[0].name}`, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Visit scheduled successfully.',
        data: { id: result.insertId }
      });
    } catch (err) {
      console.error('ScheduleVisit error:', err);
      return res.status(500).json({ success: false, message: 'Failed to schedule visit' });
    }
  },

  async recordVisitReport(req, res) {
    try {
      const { id } = req.params;
      const { visit_result, recommendation, report_notes, report_document_url } = req.body;

      if (!visit_result || !recommendation) {
        return res.status(400).json({
          success: false,
          message: 'Visit result (Positive, Neutral, Negative) and recommendation are required.'
        });
      }

      const [existing] = await db.query('SELECT * FROM visits WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Visit record not found' });
      }

      let docUrl = report_document_url || null;
      if (req.file) {
        docUrl = `/uploads/reports/${req.file.filename}`;
      }

      await db.query(
        `UPDATE visits SET
          status = 'COMPLETED',
          visit_result = ?,
          recommendation = ?,
          report_notes = ?,
          report_document_url = COALESCE(?, report_document_url),
          report_submitted_at = NOW()
         WHERE id = ?`,
        [visit_result, recommendation, report_notes || null, docUrl, id]
      );

      // Advance application status to VISIT COMPLETED
      await db.query("UPDATE adoption_applications SET status = 'VISIT COMPLETED' WHERE id = ?", [existing[0].application_id]);

      await logActivity(req.user.id, req.user.username, 'SUBMIT_VISIT_REPORT', `Recorded visit evaluation for visit #${id}: ${visit_result}`, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Visit report and recommendation submitted successfully.'
      });
    } catch (err) {
      console.error('RecordVisitReport error:', err);
      return res.status(500).json({ success: false, message: 'Failed to record visit report' });
    }
  },

  async updateVisit(req, res) {
    try {
      const { id } = req.params;
      const { visit_date, visit_time, location, assigned_staff_id, status, notes } = req.body;

      await db.query(
        `UPDATE visits SET
          visit_date = COALESCE(?, visit_date),
          visit_time = COALESCE(?, visit_time),
          location = COALESCE(?, location),
          assigned_staff_id = COALESCE(?, assigned_staff_id),
          status = COALESCE(?, status),
          notes = ?
         WHERE id = ?`,
        [visit_date, visit_time, location, assigned_staff_id, status, notes || null, id]
      );

      return res.status(200).json({ success: true, message: 'Visit details updated.' });
    } catch (err) {
      console.error('UpdateVisit error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update visit details' });
    }
  }
};
