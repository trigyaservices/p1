/**
 * Vaccination & Health Reminder Controller
 * Manages core immunizations, deworming, checkups, and calculates overdue/due soon alerts
 */

const db = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

function computeVaccineStatus(nextDueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(nextDueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'OVERDUE', color: 'RED', daysRemaining: diffDays };
  } else if (diffDays <= 7) {
    return { status: 'DUE_SOON', color: 'ORANGE', daysRemaining: diffDays };
  } else {
    return { status: 'UPCOMING', color: 'GREEN', daysRemaining: diffDays };
  }
}

module.exports = {
  async getAllVaccinations(req, res) {
    try {
      const { pet_id, status, record_type, search } = req.query;
      let sql = `SELECT v.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed
                 FROM vaccinations v
                 INNER JOIN pets p ON p.id = v.pet_id
                 WHERE 1=1`;
      const params = [];

      if (pet_id) {
        sql += ` AND v.pet_id = ?`;
        params.push(pet_id);
      }
      if (record_type && record_type !== 'All') {
        sql += ` AND v.record_type = ?`;
        params.push(record_type);
      }
      if (search) {
        sql += ` AND (p.name LIKE ? OR v.vaccine_name LIKE ? OR v.vet_name LIKE ?)`;
        const kw = `%${search}%`;
        params.push(kw, kw, kw);
      }

      sql += ` ORDER BY v.next_due_date ASC, v.id DESC`;

      const [rows] = await db.query(sql, params);

      // Enhance with real-time computed status
      let enriched = rows.map(v => {
        const computed = computeVaccineStatus(v.next_due_date);
        return {
          ...v,
          computed_status: computed.status,
          status_color: computed.color,
          days_remaining: computed.daysRemaining
        };
      });

      if (status && status !== 'All') {
        enriched = enriched.filter(e => e.computed_status === status);
      }

      return res.status(200).json({ success: true, count: enriched.length, data: enriched });
    } catch (err) {
      console.error('GetAllVaccinations error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve vaccination schedule' });
    }
  },

  async getVaccinationAlerts(req, res) {
    try {
      const sql = `SELECT v.*, p.name as pet_name, p.pet_code, p.animal_type, p.primary_photo_url
                   FROM vaccinations v
                   INNER JOIN pets p ON p.id = v.pet_id
                   ORDER BY v.next_due_date ASC`;

      const [rows] = await db.query(sql);

      const overdue = [];
      const dueSoon = [];
      const upcoming = [];

      rows.forEach(v => {
        const comp = computeVaccineStatus(v.next_due_date);
        const item = {
          ...v,
          computed_status: comp.status,
          status_color: comp.color,
          days_remaining: comp.daysRemaining
        };

        if (comp.status === 'OVERDUE') overdue.push(item);
        else if (comp.status === 'DUE_SOON') dueSoon.push(item);
        else upcoming.push(item);
      });

      return res.status(200).json({
        success: true,
        data: {
          overdue,
          dueSoon,
          upcoming,
          overdueCount: overdue.length,
          dueSoonCount: dueSoon.length
        }
      });
    } catch (err) {
      console.error('GetVaccinationAlerts error:', err);
      return res.status(500).json({ success: false, message: 'Failed to compute vaccination alerts' });
    }
  },

  async createVaccination(req, res) {
    try {
      const { pet_id, vaccine_name, record_type, vaccine_date, next_due_date, vet_name, notes, certificate_url } = req.body;

      if (!pet_id || !vaccine_name || !vaccine_date || !next_due_date || !vet_name) {
        return res.status(400).json({
          success: false,
          message: 'Pet ID, vaccine/reminder name, date administered, next due date, and vet name are mandatory.'
        });
      }

      const [pets] = await db.query('SELECT id, name, pet_code FROM pets WHERE id = ?', [pet_id]);
      if (!pets || pets.length === 0) {
        return res.status(404).json({ success: false, message: 'Pet not found' });
      }

      let certUrl = certificate_url || null;
      if (req.file) {
        certUrl = `/uploads/vaccines/${req.file.filename}`;
      }

      const computed = computeVaccineStatus(next_due_date);

      const [result] = await db.query(
        `INSERT INTO vaccinations (pet_id, vaccine_name, record_type, vaccine_date, next_due_date, vet_name, certificate_url, notes, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          pet_id, vaccine_name.trim(), record_type || 'Vaccination',
          vaccine_date, next_due_date, vet_name.trim(),
          certUrl, notes || null, computed.status, req.user.id
        ]
      );

      // Create notification if due soon or overdue
      if (computed.status === 'DUE_SOON' || computed.status === 'OVERDUE') {
        const notifTitle = computed.status === 'OVERDUE' ? 'Vaccination Overdue' : 'Vaccination Due Soon';
        const notifMsg = `${pets[0].name} (${pets[0].pet_code}) ${vaccine_name} is ${computed.status === 'OVERDUE' ? 'overdue' : 'due in ' + computed.daysRemaining + ' days'}.`;
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type, related_entity, related_id, is_read, created_at)
           VALUES (NULL, ?, ?, ?, 'vaccinations', ?, 0, NOW())`,
          [notifTitle, notifMsg, computed.status === 'OVERDUE' ? 'VACCINATION_OVERDUE' : 'VACCINATION_DUE', result.insertId]
        );
      }

      await logActivity(req.user.id, req.user.username, 'ADD_VACCINATION', `Logged ${record_type || 'vaccination'} (${vaccine_name}) for ${pets[0].name}`, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Vaccination entry registered successfully.',
        data: { id: result.insertId, status: computed.status, status_color: computed.color }
      });
    } catch (err) {
      console.error('CreateVaccination error:', err);
      return res.status(500).json({ success: false, message: 'Failed to record vaccination' });
    }
  },

  async updateVaccination(req, res) {
    try {
      const { id } = req.params;
      const { vaccine_name, record_type, vaccine_date, next_due_date, vet_name, notes, certificate_url, status } = req.body;

      const [existing] = await db.query('SELECT * FROM vaccinations WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Vaccination record not found' });
      }

      let certUrl = certificate_url !== undefined ? certificate_url : existing[0].certificate_url;
      if (req.file) {
        certUrl = `/uploads/vaccines/${req.file.filename}`;
      }

      const finalDueDate = next_due_date || existing[0].next_due_date;
      const computed = computeVaccineStatus(finalDueDate);

      await db.query(
        `UPDATE vaccinations SET
          vaccine_name = COALESCE(?, vaccine_name),
          record_type = COALESCE(?, record_type),
          vaccine_date = COALESCE(?, vaccine_date),
          next_due_date = COALESCE(?, next_due_date),
          vet_name = COALESCE(?, vet_name),
          certificate_url = ?,
          notes = ?,
          status = ?
         WHERE id = ?`,
        [
          vaccine_name, record_type, vaccine_date, next_due_date,
          vet_name, certUrl, notes || null, status || computed.status, id
        ]
      );

      await logActivity(req.user.id, req.user.username, 'EDIT_VACCINATION', `Updated vaccination record #${id}`, req.ip);

      return res.status(200).json({ success: true, message: 'Vaccination record updated successfully.' });
    } catch (err) {
      console.error('UpdateVaccination error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update vaccination' });
    }
  },

  async deleteVaccination(req, res) {
    try {
      const { id } = req.params;
      const [existing] = await db.query('SELECT * FROM vaccinations WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Vaccination record not found' });
      }

      await db.query('DELETE FROM vaccinations WHERE id = ?', [id]);
      await logActivity(req.user.id, req.user.username, 'DELETE_VACCINATION', `Deleted vaccination record #${id}`, req.ip);

      return res.status(200).json({ success: true, message: 'Vaccination record deleted successfully.' });
    } catch (err) {
      console.error('DeleteVaccination error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete vaccination' });
    }
  }
};
