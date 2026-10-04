/**
 * Monthly Pet Progress & Health Report Controller
 * Tracks longitudinal pet health, weight progression, food habits, and monthly documentation
 */

const db = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  async getAllReports(req, res) {
    try {
      const { pet_id, month, search } = req.query;
      let sql = `SELECT mr.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed, p.primary_photo_url
                 FROM monthly_reports mr
                 INNER JOIN pets p ON p.id = mr.pet_id
                 WHERE 1=1`;
      const params = [];

      if (pet_id) {
        sql += ` AND mr.pet_id = ?`;
        params.push(pet_id);
      }
      if (month) {
        sql += ` AND mr.report_month = ?`;
        params.push(month);
      }
      if (search) {
        sql += ` AND (p.name LIKE ? OR mr.health_condition LIKE ? OR mr.remarks LIKE ?)`;
        const kw = `%${search}%`;
        params.push(kw, kw, kw);
      }

      sql += ` ORDER BY mr.report_month DESC, mr.id DESC`;

      const [rows] = await db.query(sql, params);
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('GetAllReports error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve monthly reports' });
    }
  },

  async getPetTimeline(req, res) {
    try {
      const { petId } = req.params;
      const [reports] = await db.query(
        `SELECT mr.*, u.name as created_by_name
         FROM monthly_reports mr
         LEFT JOIN users u ON u.id = mr.created_by
         WHERE mr.pet_id = ?
         ORDER BY mr.report_month ASC`,
        [petId]
      );

      return res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (err) {
      console.error('GetPetTimeline error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch pet monthly timeline' });
    }
  },

  async createReport(req, res) {
    try {
      const { pet_id, report_month, weight, health_condition, behaviour, food, treatment, remarks, document_url } = req.body;

      if (!pet_id || !report_month || !weight || !health_condition || !behaviour || !food) {
        return res.status(400).json({
          success: false,
          message: 'Pet ID, report month (YYYY-MM), weight, health condition, behaviour, and food details are mandatory.'
        });
      }

      // Verify no duplicate for pet & month
      const [existing] = await db.query('SELECT id FROM monthly_reports WHERE pet_id = ? AND report_month = ?', [pet_id, report_month]);
      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: `A report for month ${report_month} has already been filed for this pet. Previous reports are strictly preserved.`
        });
      }

      const [pets] = await db.query('SELECT name, pet_code FROM pets WHERE id = ?', [pet_id]);
      if (!pets || pets.length === 0) {
        return res.status(404).json({ success: false, message: 'Pet not found' });
      }

      let docUrl = document_url || null;
      if (req.file) {
        docUrl = `/uploads/reports/${req.file.filename}`;
      }

      const [result] = await db.query(
        `INSERT INTO monthly_reports (pet_id, report_month, weight, health_condition, behaviour, food, treatment, remarks, document_url, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          pet_id, report_month, parseFloat(weight),
          health_condition.trim(), behaviour.trim(),
          food.trim(), treatment || null, remarks || null,
          docUrl, req.user.id
        ]
      );

      // Update pet current weight
      await db.query('UPDATE pets SET weight = ? WHERE id = ?', [parseFloat(weight), pet_id]);

      await logActivity(req.user.id, req.user.username, 'ADD_MONTHLY_REPORT', `Logged monthly evaluation for ${pets[0].name} (${report_month})`, req.ip);

      return res.status(201).json({
        success: true,
        message: `Monthly report for ${report_month} filed successfully.`,
        data: { id: result.insertId }
      });
    } catch (err) {
      console.error('CreateReport error:', err);
      return res.status(500).json({ success: false, message: 'Failed to record monthly report' });
    }
  },

  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const { weight, health_condition, behaviour, food, treatment, remarks, document_url } = req.body;

      const [existing] = await db.query('SELECT * FROM monthly_reports WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Monthly report not found' });
      }

      let docUrl = document_url !== undefined ? document_url : existing[0].document_url;
      if (req.file) {
        docUrl = `/uploads/reports/${req.file.filename}`;
      }

      await db.query(
        `UPDATE monthly_reports SET
          weight = COALESCE(?, weight),
          health_condition = COALESCE(?, health_condition),
          behaviour = COALESCE(?, behaviour),
          food = COALESCE(?, food),
          treatment = ?,
          remarks = ?,
          document_url = ?
         WHERE id = ?`,
        [
          weight ? parseFloat(weight) : null,
          health_condition, behaviour, food,
          treatment || null, remarks || null,
          docUrl, id
        ]
      );

      await logActivity(req.user.id, req.user.username, 'EDIT_MONTHLY_REPORT', `Updated monthly report #${id}`, req.ip);

      return res.status(200).json({ success: true, message: 'Monthly report updated successfully.' });
    } catch (err) {
      console.error('UpdateReport error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update monthly report' });
    }
  },

  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const [existing] = await db.query('SELECT * FROM monthly_reports WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      await db.query('DELETE FROM monthly_reports WHERE id = ?', [id]);
      await logActivity(req.user.id, req.user.username, 'DELETE_MONTHLY_REPORT', `Deleted monthly report #${id}`, req.ip);

      return res.status(200).json({ success: true, message: 'Monthly report deleted successfully.' });
    } catch (err) {
      console.error('DeleteReport error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete monthly report' });
    }
  }
};
