/**
 * Pet Management Controller
 * Comprehensive CRUD, Photo Gallery, Auto Pet ID generation, Search & Filter
 */

const db = require('../config/db');
const { generatePetCode } = require('../utils/security');
const { logActivity } = require('../middleware/activityLogger');
const fs = require('fs');
const path = require('path');

module.exports = {
  // Public Catalog (non-sensitive fields)
  async getPublicCatalog(req, res) {
    try {
      const { type, breed, gender, search, status } = req.query;
      let sql = `SELECT id, pet_code, name, animal_type, breed, age, gender, color, weight,
                        current_location, health_status, behaviour, description, adoption_status,
                        primary_photo_url, created_at
                 FROM pets WHERE 1=1`;
      const params = [];

      if (type && type !== 'All') {
        sql += ` AND animal_type = ?`;
        params.push(type);
      }
      if (gender && gender !== 'All') {
        sql += ` AND gender = ?`;
        params.push(gender);
      }
      if (status && status !== 'All') {
        sql += ` AND adoption_status = ?`;
        params.push(status);
      } else {
        // Default only show available / pending pets publicly unless specified
        sql += ` AND adoption_status IN ('Available', 'Application Pending', 'Visit Scheduled')`;
      }
      if (search) {
        sql += ` AND (name LIKE ? OR breed LIKE ? OR description LIKE ? OR pet_code LIKE ?)`;
        const kw = `%${search}%`;
        params.push(kw, kw, kw, kw);
      }

      sql += ` ORDER BY id DESC`;

      const [rows] = await db.query(sql, params);
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('Public catalog error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch public pets catalog' });
    }
  },

  // Public Pet Profile
  async getPublicPet(req, res) {
    try {
      const { id } = req.params;
      const [pets] = await db.query(
        `SELECT id, pet_code, name, animal_type, breed, dob, age, gender, color, weight,
                current_location, health_status, behaviour, description, adoption_status,
                primary_photo_url, created_at
         FROM pets WHERE id = ?`,
        [id]
      );

      if (!pets || pets.length === 0) {
        return res.status(404).json({ success: false, message: 'Pet not found' });
      }

      const pet = pets[0];
      const [photos] = await db.query('SELECT id, photo_url, caption, is_primary FROM pet_photos WHERE pet_id = ? ORDER BY is_primary DESC, id ASC', [id]);
      pet.photos = photos;

      return res.status(200).json({ success: true, data: pet });
    } catch (err) {
      console.error('Public pet error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch public pet profile' });
    }
  },

  // Admin / Staff Pet List with Filters & Pagination
  async getAllPets(req, res) {
    try {
      const { search, animal_type, adoption_status, health_status, gender, page = 1, limit = 20 } = req.query;
      let sql = 'SELECT * FROM pets WHERE 1=1';
      const params = [];

      if (animal_type && animal_type !== 'All') {
        sql += ' AND animal_type = ?';
        params.push(animal_type);
      }
      if (adoption_status && adoption_status !== 'All') {
        sql += ' AND adoption_status = ?';
        params.push(adoption_status);
      }
      if (health_status && health_status !== 'All') {
        sql += ' AND health_status = ?';
        params.push(health_status);
      }
      if (gender && gender !== 'All') {
        sql += ' AND gender = ?';
        params.push(gender);
      }
      if (search) {
        sql += ' AND (name LIKE ? OR pet_code LIKE ? OR breed LIKE ? OR current_location LIKE ?)';
        const kw = `%${search}%`;
        params.push(kw, kw, kw, kw);
      }

      // Count total before pagination
      const [allMatched] = await db.query(sql, params);
      const total = allMatched.length;

      sql += ' ORDER BY id DESC';

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      sql += ` LIMIT ${parseInt(limit, 10)} OFFSET ${offset}`;

      const [rows] = await db.query(sql, params);

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10))
        }
      });
    } catch (err) {
      console.error('GetAllPets error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve pets list' });
    }
  },

  // Detailed Admin Pet Profile (With All Tabs)
  async getPetById(req, res) {
    try {
      const { id } = req.params;
      const [pets] = await db.query('SELECT * FROM pets WHERE id = ?', [id]);
      if (!pets || pets.length === 0) {
        return res.status(404).json({ success: false, message: 'Pet not found' });
      }

      const pet = pets[0];

      // Photos
      const [photos] = await db.query('SELECT * FROM pet_photos WHERE pet_id = ? ORDER BY is_primary DESC, id ASC', [id]);
      pet.photos = photos;

      // Medical History
      const [medical] = await db.query('SELECT * FROM medical_records WHERE pet_id = ? ORDER BY record_date DESC', [id]);
      pet.medical_records = medical;

      // Vaccinations
      const [vaccinations] = await db.query('SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY next_due_date ASC', [id]);
      // Dynamic status calculation
      const today = new Date().toISOString().split('T')[0];
      pet.vaccinations = vaccinations.map(v => {
        const dueDate = new Date(v.next_due_date);
        const now = new Date(today);
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        let computedStatus = 'UPCOMING';
        if (diffDays < 0) computedStatus = 'OVERDUE';
        else if (diffDays <= 7) computedStatus = 'DUE_SOON';
        return { ...v, computed_status: computedStatus, days_remaining: diffDays };
      });

      // Monthly Reports
      const [reports] = await db.query('SELECT * FROM monthly_reports WHERE pet_id = ? ORDER BY report_month DESC', [id]);
      pet.monthly_reports = reports;

      // Adoption Applications & Records
      const [applications] = await db.query('SELECT * FROM adoption_applications WHERE pet_id = ? ORDER BY id DESC', [id]);
      pet.adoption_applications = applications;

      const [adoptionRecord] = await db.query('SELECT * FROM adoption_records WHERE pet_id = ?', [id]);
      pet.adoption_record = adoptionRecord[0] || null;

      // Foster History
      const [fosterHistory] = await db.query('SELECT * FROM foster_records WHERE pet_id = ? ORDER BY id DESC', [id]);
      pet.foster_history = fosterHistory;

      return res.status(200).json({ success: true, data: pet });
    } catch (err) {
      console.error('GetPetById error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch complete pet profile' });
    }
  },

  // Create Pet
  async createPet(req, res) {
    try {
      const {
        name, animal_type, breed, dob, age, gender, color, weight,
        identification_mark, microchip_number, rescue_date, rescue_location,
        current_location, health_status, behaviour, description, adoption_status,
        primary_photo_url, rescue_id
      } = req.body;

      if (!name || !animal_type || !breed || !gender) {
        return res.status(400).json({
          success: false,
          message: 'Pet name, animal type, breed, and gender are mandatory.'
        });
      }

      // Generate next unique Pet ID: PET-YYYY-XXXXX
      const [countResult] = await db.query('SELECT COUNT(*) as count FROM pets');
      const nextNum = (countResult[0]?.count || 0) + 1;
      const petCode = generatePetCode(nextNum);

      const [result] = await db.query(
        `INSERT INTO pets (
          pet_code, name, animal_type, breed, dob, age, gender, color, weight,
          identification_mark, microchip_number, rescue_date, rescue_location,
          current_location, health_status, behaviour, description, adoption_status,
          primary_photo_url, rescue_id, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          petCode, name.trim(), animal_type, breed.trim(), dob || null, age || null,
          gender, color || 'Standard', weight ? parseFloat(weight) : null,
          identification_mark || null, microchip_number || null,
          rescue_date || null, rescue_location || null,
          current_location || 'Main Shelter', health_status || 'Healthy',
          behaviour || null, description || null, adoption_status || 'Available',
          primary_photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
          rescue_id ? parseInt(rescue_id, 10) : null,
          req.user.id
        ]
      );

      const newPetId = result.insertId;

      // If primary photo was provided, insert into pet_photos
      if (primary_photo_url) {
        await db.query(
          `INSERT INTO pet_photos (pet_id, photo_url, file_name, caption, is_primary, uploaded_by, created_at)
           VALUES (?, ?, ?, ?, 1, ?, NOW())`,
          [newPetId, primary_photo_url, 'primary_photo.jpg', 'Main profile photo', req.user.id]
        );
      }

      await logActivity(req.user.id, req.user.username, 'ADD_PET', `Created pet profile for ${name} (${petCode})`, req.ip);

      return res.status(201).json({
        success: true,
        message: `Pet ${name} registered successfully with ID ${petCode}.`,
        data: { id: newPetId, pet_code: petCode }
      });
    } catch (err) {
      console.error('CreatePet error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create pet record' });
    }
  },

  // Update Pet
  async updatePet(req, res) {
    try {
      const { id } = req.params;
      const {
        name, animal_type, breed, dob, age, gender, color, weight,
        identification_mark, microchip_number, rescue_date, rescue_location,
        current_location, health_status, behaviour, description, adoption_status,
        primary_photo_url
      } = req.body;

      const [existing] = await db.query('SELECT id, pet_code, name FROM pets WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Pet not found' });
      }

      await db.query(
        `UPDATE pets SET
          name = COALESCE(?, name),
          animal_type = COALESCE(?, animal_type),
          breed = COALESCE(?, breed),
          dob = ?,
          age = COALESCE(?, age),
          gender = COALESCE(?, gender),
          color = COALESCE(?, color),
          weight = ?,
          identification_mark = ?,
          microchip_number = ?,
          rescue_date = ?,
          rescue_location = ?,
          current_location = COALESCE(?, current_location),
          health_status = COALESCE(?, health_status),
          behaviour = ?,
          description = ?,
          adoption_status = COALESCE(?, adoption_status),
          primary_photo_url = COALESCE(?, primary_photo_url)
         WHERE id = ?`,
        [
          name, animal_type, breed, dob || null, age, gender, color,
          weight ? parseFloat(weight) : null, identification_mark || null,
          microchip_number || null, rescue_date || null, rescue_location || null,
          current_location, health_status, behaviour || null, description || null,
          adoption_status, primary_photo_url, id
        ]
      );

      await logActivity(req.user.id, req.user.username, 'EDIT_PET', `Updated pet profile for ${existing[0].name} (${existing[0].pet_code})`, req.ip);

      return res.status(200).json({
        success: true,
        message: 'Pet profile updated successfully.'
      });
    } catch (err) {
      console.error('UpdatePet error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update pet record' });
    }
  },

  // Delete Pet
  async deletePet(req, res) {
    try {
      const { id } = req.params;
      const [existing] = await db.query('SELECT id, pet_code, name FROM pets WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Pet not found' });
      }

      await db.query('DELETE FROM pets WHERE id = ?', [id]);

      await logActivity(req.user.id, req.user.username, 'DELETE_PET', `Removed pet record for ${existing[0].name} (${existing[0].pet_code})`, req.ip);

      return res.status(200).json({
        success: true,
        message: `Pet record for ${existing[0].name} has been removed successfully.`
      });
    } catch (err) {
      console.error('DeletePet error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete pet record' });
    }
  },

  // Upload Pet Photo
  async uploadPhoto(req, res) {
    try {
      const { id } = req.params;
      const { caption, is_primary, photo_url } = req.body;

      const [existing] = await db.query('SELECT id, name, primary_photo_url FROM pets WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Pet not found' });
      }

      let finalUrl = photo_url;
      let fileName = 'uploaded_image.jpg';

      if (req.file) {
        finalUrl = `/uploads/pets/${req.file.filename}`;
        fileName = req.file.originalname;
      }

      if (!finalUrl) {
        return res.status(400).json({ success: false, message: 'Photo file or URL must be provided.' });
      }

      const isPrimaryBool = is_primary === 'true' || is_primary === true || is_primary === 1;

      if (isPrimaryBool) {
        await db.query('UPDATE pet_photos SET is_primary = 0 WHERE pet_id = ?', [id]);
        await db.query('UPDATE pets SET primary_photo_url = ? WHERE id = ?', [finalUrl, id]);
      }

      const [result] = await db.query(
        `INSERT INTO pet_photos (pet_id, photo_url, file_name, caption, is_primary, uploaded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id, finalUrl, fileName, caption || null, isPrimaryBool ? 1 : 0, req.user.id]
      );

      await logActivity(req.user.id, req.user.username, 'UPLOAD_PHOTO', `Uploaded new photo for ${existing[0].name}`, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Photo uploaded successfully.',
        data: { id: result.insertId, photo_url: finalUrl, is_primary: isPrimaryBool }
      });
    } catch (err) {
      console.error('UploadPhoto error:', err);
      return res.status(500).json({ success: false, message: 'Failed to upload photo' });
    }
  },

  // Set Primary Photo
  async setPrimaryPhoto(req, res) {
    try {
      const { id, photoId } = req.params;

      const [photo] = await db.query('SELECT photo_url FROM pet_photos WHERE id = ? AND pet_id = ?', [photoId, id]);
      if (!photo || photo.length === 0) {
        return res.status(404).json({ success: false, message: 'Photo not found for this pet' });
      }

      await db.query('UPDATE pet_photos SET is_primary = 0 WHERE pet_id = ?', [id]);
      await db.query('UPDATE pet_photos SET is_primary = 1 WHERE id = ?', [photoId]);
      await db.query('UPDATE pets SET primary_photo_url = ? WHERE id = ?', [photo[0].photo_url, id]);

      return res.status(200).json({
        success: true,
        message: 'Primary photo updated successfully.'
      });
    } catch (err) {
      console.error('SetPrimaryPhoto error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update primary photo' });
    }
  },

  // Delete Photo
  async deletePhoto(req, res) {
    try {
      const { id, photoId } = req.params;

      const [photo] = await db.query('SELECT * FROM pet_photos WHERE id = ? AND pet_id = ?', [photoId, id]);
      if (!photo || photo.length === 0) {
        return res.status(404).json({ success: false, message: 'Photo not found' });
      }

      await db.query('DELETE FROM pet_photos WHERE id = ?', [photoId]);

      // If primary was deleted, set next photo as primary
      if (photo[0].is_primary) {
        const [remaining] = await db.query('SELECT id, photo_url FROM pet_photos WHERE pet_id = ? ORDER BY id ASC LIMIT 1', [id]);
        if (remaining && remaining.length > 0) {
          await db.query('UPDATE pet_photos SET is_primary = 1 WHERE id = ?', [remaining[0].id]);
          await db.query('UPDATE pets SET primary_photo_url = ? WHERE id = ?', [remaining[0].photo_url, id]);
        } else {
          await db.query('UPDATE pets SET primary_photo_url = NULL WHERE id = ?', [id]);
        }
      }

      return res.status(200).json({ success: true, message: 'Photo removed successfully.' });
    } catch (err) {
      console.error('DeletePhoto error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete photo' });
    }
  }
};
