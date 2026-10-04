/**
 * Medical Records Controller
 * Manages clinical diagnoses, treatments, medications, and medical documents
 */

const db = require('../config/db');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  async getAllMedicalRecords(req, res) {
    try {
      const { pet_id, search } = req.query;
      let sql = `SELECT m.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed
                 FROM medical_records m
                 INNER JOIN pets p ON p.id = m.pet_id
                 WHERE 1=1`;
      const params = [];

      if (pet_id) {
        sql += ` AND m.pet_id = ?`;
        params.push(pet_id);
      }
      if (search) {
        sql += ` AND (p.name LIKE ? OR m.diagnosis LIKE ? OR m.vet_name LIKE ? OR m.treatment LIKE ?)`;
        const kw = `%${search}%`;
        params.push(kw, kw, kw, kw);
      }

      sql += ` ORDER BY m.record_date DESC, m.id DESC`;

      const [rows] = await db.query(sql, params);
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('GetAllMedicalRecords error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve medical records' });
    }
  },

  async getMedicalRecordById(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await db.query(
        `SELECT m.*, p.name as pet_name, p.pet_code, p.animal_type, p.breed
         FROM medical_records m
         INNER JOIN pets p ON p.id = m.pet_id
         WHERE m.id = ?`,
        [id]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Medical record not found' });
      }

      return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
      console.error('GetMedicalRecordById error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch medical record' });
    }
  },

  async createMedicalRecord(req, res) {
    try {
      const { pet_id, record_date, vet_name, diagnosis, symptoms, treatment, medicine, notes, document_url } = req.body;

      if (!pet_id || !record_date || !vet_name || !diagnosis || !treatment) {
        return res.status(400).json({
          success: false,
          message: 'Pet ID, record date, veterinarian name, diagnosis, and treatment plan are mandatory.'
        });
      }

      // Check pet exists
      const [pets] = await db.query('SELECT id, name, pet_code FROM pets WHERE id = ?', [pet_id]);
      if (!pets || pets.length === 0) {
        return res.status(404).json({ success: false, message: 'Selected pet does not exist.' });
      }

      let docUrl = document_url || null;
      let docName = null;

      if (req.file) {
        docUrl = `/uploads/medical/${req.file.filename}`;
        docName = req.file.originalname;
      }

      const [result] = await db.query(
        `INSERT INTO medical_records (pet_id, record_date, vet_name, diagnosis, symptoms, treatment, medicine, notes, document_url, document_name, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          pet_id, record_date, vet_name.trim(), diagnosis.trim(),
          symptoms || null, treatment.trim(), medicine || null,
          notes || null, docUrl, docName, req.user.id
        ]
      );

      await logActivity(req.user.id, req.user.username, 'ADD_MEDICAL_RECORD', `Added medical report for ${pets[0].name} (${pets[0].pet_code}): ${diagnosis}`, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Medical evaluation record filed successfully.',
        data: { id: result.insertId }
      });
    } catch (err) {
      console.error('CreateMedicalRecord error:', err);
      return res.status(500).json({ success: false, message: 'Failed to record medical entry' });
    }
  },

  async updateMedicalRecord(req, res) {
    try {
      const { id } = req.params;
      const { record_date, vet_name, diagnosis, symptoms, treatment, medicine, notes, document_url } = req.body;

      const [existing] = await db.query('SELECT * FROM medical_records WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Medical record not found' });
      }

      let docUrl = document_url !== undefined ? document_url : existing[0].document_url;
      let docName = existing[0].document_name;

      if (req.file) {
        docUrl = `/uploads/medical/${req.file.filename}`;
        docName = req.file.originalname;
      }

      await db.query(
        `UPDATE medical_records SET
          record_date = COALESCE(?, record_date),
          vet_name = COALESCE(?, vet_name),
          diagnosis = COALESCE(?, diagnosis),
          symptoms = ?,
          treatment = COALESCE(?, treatment),
          medicine = ?,
          notes = ?,
          document_url = ?,
          document_name = ?
         WHERE id = ?`,
        [
          record_date, vet_name, diagnosis, symptoms || null,
          treatment, medicine || null, notes || null,
          docUrl, docName, id
        ]
      );

      await logActivity(req.user.id, req.user.username, 'EDIT_MEDICAL_RECORD', `Updated medical record #${id}`, req.ip);

      return res.status(200).json({ success: true, message: 'Medical record updated successfully.' });
    } catch (err) {
      console.error('UpdateMedicalRecord error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update medical record' });
    }
  },

  async deleteMedicalRecord(req, res) {
    try {
      const { id } = req.params;
      const [existing] = await db.query('SELECT * FROM medical_records WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Medical record not found' });
      }

      await db.query('DELETE FROM medical_records WHERE id = ?', [id]);
      await logActivity(req.user.id, req.user.username, 'DELETE_MEDICAL_RECORD', `Deleted medical record #${id}`, req.ip);

      return res.status(200).json({ success: true, message: 'Medical record deleted successfully.' });
    } catch (err) {
      console.error('DeleteMedicalRecord error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete medical record' });
    }
  }
};
