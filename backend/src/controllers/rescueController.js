/**
 * Rescue Operations Controller
 * Logs field rescues, emergency medical response, and facilitates converting rescue cases into Pet profiles
 */

const db = require('../config/db');
const { generateRescueCode, generatePetCode } = require('../utils/security');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  async getAllRescues(req, res) {
    try {
      const { status, pet_type, search } = req.query;
      let sql = `SELECT r.*, p.pet_code, p.name as pet_name
                 FROM rescue_records r
                 LEFT JOIN pets p ON p.id = r.converted_pet_id
                 WHERE 1=1`;
      const params = [];

      if (status && status !== 'All') {
        sql += ` AND r.status = ?`;
        params.push(status);
      }
      if (pet_type && pet_type !== 'All') {
        sql += ` AND r.pet_type = ?`;
        params.push(pet_type);
      }
      if (search) {
        sql += ` AND (r.rescue_code LIKE ? OR r.rescue_location LIKE ? OR r.rescued_by LIKE ? OR r.initial_condition LIKE ?)`;
        const kw = `%${search}%`;
        params.push(kw, kw, kw, kw);
      }

      sql += ` ORDER BY r.rescue_date DESC, r.id DESC`;

      const [rows] = await db.query(sql, params);
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('GetAllRescues error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve rescue logs' });
    }
  },

  async createRescue(req, res) {
    try {
      const { pet_type, rescue_date, rescue_location, rescued_by, initial_condition, emergency_treatment, current_location, notes, photo_url } = req.body;

      if (!pet_type || !rescue_date || !rescue_location || !rescued_by || !initial_condition) {
        return res.status(400).json({
          success: false,
          message: 'Animal type, rescue date, location, rescuer name, and initial physical condition are required.'
        });
      }

      const [countResult] = await db.query('SELECT COUNT(*) as count FROM rescue_records');
      const nextNum = (countResult[0]?.count || 0) + 1;
      const rescueCode = generateRescueCode(nextNum);

      let photo = photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
      if (req.file) {
        photo = `/uploads/rescue/${req.file.filename}`;
      }

      const [result] = await db.query(
        `INSERT INTO rescue_records (
          rescue_code, pet_type, rescue_date, rescue_location, rescued_by,
          initial_condition, emergency_treatment, photo_url, current_location,
          notes, status, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RESCUED', ?, NOW())`,
        [
          rescueCode, pet_type, rescue_date, rescue_location.trim(), rescued_by.trim(),
          initial_condition.trim(), emergency_treatment || null, photo,
          current_location || 'Intake Clinic', notes || null, req.user.id
        ]
      );

      await logActivity(req.user.id, req.user.username, 'LOG_RESCUE', `Logged rescue case ${rescueCode} (${pet_type} at ${rescue_location})`, req.ip);

      return res.status(201).json({
        success: true,
        message: `Rescue incident recorded successfully as ${rescueCode}.`,
        data: { id: result.insertId, rescue_code: rescueCode }
      });
    } catch (err) {
      console.error('CreateRescue error:', err);
      return res.status(500).json({ success: false, message: 'Failed to record rescue incident' });
    }
  },

  // Convert Rescue record to a full Pet Profile
  async convertToPet(req, res) {
    try {
      const { id } = req.params;
      const { name, breed, gender, color, weight, health_status, behaviour, description } = req.body;

      if (!name || !breed || !gender) {
        return res.status(400).json({
          success: false,
          message: 'Pet name, breed, and gender are required to create the official pet profile.'
        });
      }

      const [rescueRows] = await db.query('SELECT * FROM rescue_records WHERE id = ?', [id]);
      if (!rescueRows || rescueRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Rescue record not found' });
      }

      const rescue = rescueRows[0];
      if (rescue.status === 'CONVERTED_TO_PET') {
        return res.status(400).json({
          success: false,
          message: `This rescue case has already been converted to pet ID ${rescue.converted_pet_id}.`
        });
      }

      // Generate Pet Code
      const [countResult] = await db.query('SELECT COUNT(*) as count FROM pets');
      const nextNum = (countResult[0]?.count || 0) + 1;
      const petCode = generatePetCode(nextNum);

      const [petResult] = await db.query(
        `INSERT INTO pets (
          pet_code, name, animal_type, breed, dob, age, gender, color, weight,
          rescue_date, rescue_location, current_location, health_status,
          behaviour, description, adoption_status, primary_photo_url, rescue_id,
          created_by, created_at
        ) VALUES (?, ?, ?, ?, NULL, 'Estimated Adult', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', ?, ?, ?, NOW())`,
        [
          petCode, name.trim(), rescue.pet_type, breed.trim(),
          gender, color || 'Standard', weight ? parseFloat(weight) : null,
          rescue.rescue_date, rescue.rescue_location, rescue.current_location,
          health_status || 'Under Treatment', behaviour || 'Recovering from rescue trauma',
          description || `Rescued on ${rescue.rescue_date} from ${rescue.rescue_location}. Initial condition: ${rescue.initial_condition}.`,
          rescue.photo_url, id, req.user.id
        ]
      );

      const newPetId = petResult.insertId;

      // Add rescue photo to pet photos
      if (rescue.photo_url) {
        await db.query(
          `INSERT INTO pet_photos (pet_id, photo_url, file_name, caption, is_primary, uploaded_by, created_at)
           VALUES (?, ?, ?, 'Rescue initial intake photo', 1, ?, NOW())`,
          [newPetId, rescue.photo_url, 'rescue_intake.jpg', req.user.id]
        );
      }

      // Update rescue record status
      await db.query(
        "UPDATE rescue_records SET status = 'CONVERTED_TO_PET', converted_pet_id = ? WHERE id = ?",
        [newPetId, id]
      );

      await logActivity(req.user.id, req.user.username, 'CONVERT_RESCUE_TO_PET', `Enrolled rescue ${rescue.rescue_code} into pet registry as ${name} (${petCode})`, req.ip);

      return res.status(201).json({
        success: true,
        message: `Rescue ${rescue.rescue_code} converted to Pet Profile ${petCode} (${name}).`,
        data: { pet_id: newPetId, pet_code: petCode }
      });
    } catch (err) {
      console.error('ConvertToPet error:', err);
      return res.status(500).json({ success: false, message: 'Failed to convert rescue into pet' });
    }
  }
};
