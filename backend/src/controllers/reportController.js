/**
 * Reports & Data Export Controller
 * Generates structured summaries, printable tables, and CSV exports across all modules
 */

const db = require('../config/db');

module.exports = {
  async getReportData(req, res) {
    try {
      const { type } = req.params;
      let data = [];
      let filename = 'report.csv';

      switch (type) {
        case 'total-pets':
          [data] = await db.query('SELECT pet_code, name, animal_type, breed, age, gender, color, weight, current_location, health_status, adoption_status, created_at FROM pets ORDER BY id DESC');
          filename = 'total_pets_inventory.csv';
          break;

        case 'available-pets':
          [data] = await db.query("SELECT pet_code, name, animal_type, breed, age, gender, weight, current_location, health_status FROM pets WHERE adoption_status = 'Available' ORDER BY id DESC");
          filename = 'available_pets_for_adoption.csv';
          break;

        case 'adopted-pets':
          [data] = await db.query(
            `SELECT ar.certificate_code, ar.adoption_date, ar.applicant_name, ar.applicant_email, ar.applicant_phone,
                    p.pet_code, p.name as pet_name, p.animal_type, p.breed
             FROM adoption_records ar
             INNER JOIN pets p ON p.id = ar.pet_id
             ORDER BY ar.adoption_date DESC`
          );
          filename = 'adopted_pets_registry.csv';
          break;

        case 'rescue-report':
          [data] = await db.query('SELECT rescue_code, pet_type, rescue_date, rescue_location, rescued_by, initial_condition, status FROM rescue_records ORDER BY rescue_date DESC');
          filename = 'rescue_operations_report.csv';
          break;

        case 'adoption-report':
          [data] = await db.query(
            `SELECT a.application_code, a.applicant_name, a.mobile_number, a.email, a.city, a.status, a.created_at,
                    p.pet_code, p.name as pet_name
             FROM adoption_applications a
             INNER JOIN pets p ON p.id = a.pet_id
             ORDER BY a.id DESC`
          );
          filename = 'adoption_applications_report.csv';
          break;

        case 'vaccination-report':
          [data] = await db.query(
            `SELECT p.pet_code, p.name as pet_name, v.vaccine_name, v.record_type, v.vaccine_date, v.next_due_date, v.vet_name, v.status
             FROM vaccinations v
             INNER JOIN pets p ON p.id = v.pet_id
             ORDER BY v.next_due_date ASC`
          );
          filename = 'vaccination_and_health_alerts.csv';
          break;

        case 'medical-report':
          [data] = await db.query(
            `SELECT p.pet_code, p.name as pet_name, m.record_date, m.vet_name, m.diagnosis, m.treatment, m.medicine
             FROM medical_records m
             INNER JOIN pets p ON p.id = m.pet_id
             ORDER BY m.record_date DESC`
          );
          filename = 'clinical_medical_records.csv';
          break;

        case 'foster-report':
          [data] = await db.query(
            `SELECT p.pet_code, p.name as pet_name, f.foster_person, f.mobile, f.start_date, f.expected_end_date, f.actual_end_date, f.status
             FROM foster_records f
             INNER JOIN pets p ON p.id = f.pet_id
             ORDER BY f.start_date DESC`
          );
          filename = 'foster_care_placements.csv';
          break;

        case 'monthly-pet-report':
          [data] = await db.query(
            `SELECT p.pet_code, p.name as pet_name, mr.report_month, mr.weight, mr.health_condition, mr.food, mr.remarks
             FROM monthly_reports mr
             INNER JOIN pets p ON p.id = mr.pet_id
             ORDER BY mr.report_month DESC`
          );
          filename = 'monthly_progress_evaluations.csv';
          break;

        default:
          return res.status(400).json({ success: false, message: 'Invalid report type requested.' });
      }

      // Check if format=csv requested
      if (req.query.format === 'csv') {
        if (!data || data.length === 0) {
          return res.status(200).send('No records found');
        }
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => {
          return Object.values(row).map(val => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
          }).join(',');
        });
        const csvContent = [headers, ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
      }

      return res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
      console.error('GetReportData error:', err);
      return res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
  }
};
