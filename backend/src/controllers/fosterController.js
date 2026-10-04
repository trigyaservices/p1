/**
 * Foster Management Controller
 * Manages foster placements, return workflows, and historical foster tracking
 */

const db = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  async getAllFosterRecords(req, res) {
    try {
      const { status, pet_id, search } = req.query;
      let sql = `SELECT f.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed, p.primary_photo_url
                 FROM foster_records f
                 INNER JOIN pets p ON p.id = f.pet_id
                 WHERE 1=1`;
      const params = [];

      if (status && status !== 'All') {
        sql += ` AND f.status = ?`;
        params.push(status);
      }
      if (pet_id) {
        sql += ` AND f.pet_id = ?`;
        params.push(pet_id);
      }
      if (search) {
        sql += ` AND (f.foster_person LIKE ? OR f.mobile LIKE ? OR p.name LIKE ? OR p.pet_code LIKE ?)`;
        const kw = `%${search}%`;
        params.push(kw, kw, kw, kw);
      }

      sql += ` ORDER BY f.start_date DESC, f.id DESC`;

      const [rows] = await db.query(sql, params);
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('GetAllFosterRecords error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve foster records' });
    }
  },

  async createFosterPlacement(req, res) {
    try {
      const { pet_id, foster_person, mobile, address, start_date, expected_end_date, notes, pet_condition } = req.body;

      if (!pet_id || !foster_person || !mobile || !address || !start_date || !expected_end_date || !pet_condition) {
        return res.status(400).json({
          success: false,
          message: 'Pet ID, foster caregiver name, phone number, residential address, start date, expected end date, and pet condition are required.'
        });
      }

      const [pets] = await db.query('SELECT id, name, pet_code, adoption_status FROM pets WHERE id = ?', [pet_id]);
      if (!pets || pets.length === 0) {
        return res.status(404).json({ success: false, message: 'Pet not found' });
      }

      // Check if pet is already in active foster
      const [active] = await db.query("SELECT id FROM foster_records WHERE pet_id = ? AND status = 'ACTIVE'", [pet_id]);
      if (active && active.length > 0) {
        return res.status(400).json({ success: false, message: 'Pet is already in an active foster placement.' });
      }

      const [result] = await db.query(
        `INSERT INTO foster_records (pet_id, foster_person, mobile, address, start_date, expected_end_date, notes, pet_condition, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, NOW())`,
        [
          pet_id, foster_person.trim(), mobile.trim(), address.trim(),
          start_date, expected_end_date, notes || null,
          pet_condition.trim(), req.user.id
        ]
      );

      // Update pet status to Foster
      await db.query("UPDATE pets SET adoption_status = 'Foster' WHERE id = ?", [pet_id]);

      await logActivity(req.user.id, req.user.username, 'FOSTER_PLACEMENT', `Placed ${pets[0].name} into foster care with ${foster_person}`, req.ip);

      return res.status(201).json({
        success: true,
        message: `${pets[0].name} has been placed in foster care with ${foster_person}.`,
        data: { id: result.insertId }
      });
    } catch (err) {
      console.error('CreateFosterPlacement error:', err);
      return res.status(500).json({ success: false, message: 'Failed to record foster placement' });
    }
  },

  async returnFromFoster(req, res) {
    try {
      const { id } = req.params;
      const { actual_end_date, return_notes, return_status = 'RETURNED' } = req.body;

      const [existing] = await db.query('SELECT f.*, p.name as pet_name FROM foster_records f INNER JOIN pets p ON p.id = f.pet_id WHERE f.id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Foster record not found' });
      }

      const record = existing[0];
      const endDate = actual_end_date || new Date().toISOString().split('T')[0];

      await db.query(
        `UPDATE foster_records SET
          status = ?,
          actual_end_date = ?,
          notes = CONCAT(COALESCE(notes, ''), '\n[Return Note]: ', ?)
         WHERE id = ?`,
        [return_status, endDate, return_notes || 'Returned to shelter in good health', id]
      );

      // Revert pet status to Available if returning to shelter
      if (return_status === 'RETURNED') {
        await db.query("UPDATE pets SET adoption_status = 'Available' WHERE id = ?", [record.pet_id]);
      } else if (return_status === 'ADOPTED_BY_FOSTER') {
        await db.query("UPDATE pets SET adoption_status = 'Adopted' WHERE id = ?", [record.pet_id]);
      }

      await logActivity(req.user.id, req.user.username, 'FOSTER_RETURN', `Concluded foster placement for ${record.pet_name} (${return_status})`, req.ip);

      return res.status(200).json({
        success: true,
        message: `Foster placement concluded. Status: ${return_status}.`
      });
    } catch (err) {
      console.error('ReturnFromFoster error:', err);
      return res.status(500).json({ success: false, message: 'Failed to conclude foster care' });
    }
  }
};
