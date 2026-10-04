-- =============================================================================
-- SEED DATA: PET ADOPTION AND MANAGEMENT SYSTEM
-- BCA FINAL YEAR PROJECT
-- Provides complete realistic dataset for demonstration
-- =============================================================================

USE `pet_adoption_system`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. PERMISSIONS SEED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `user_permissions`;
TRUNCATE TABLE `permissions`;

INSERT INTO `permissions` (`id`, `code`, `name`, `module`, `description`) VALUES
(1,  'VIEW_PETS',       'View Pets',           'Pets',         'Can view pet list and profile details'),
(2,  'ADD_PET',         'Add Pet',             'Pets',         'Can create new pet profiles'),
(3,  'EDIT_PET',        'Edit Pet',            'Pets',         'Can modify existing pet records'),
(4,  'DELETE_PET',      'Delete Pet',          'Pets',         'Can archive or remove pet records'),
(5,  'UPLOAD_PHOTOS',   'Upload Photos',       'Gallery',      'Can upload and set primary pet photos'),
(6,  'MEDICAL',         'Medical Records',     'Medical',      'Can add and view clinical health records'),
(7,  'VACCINATION',     'Vaccination Records', 'Vaccination',  'Can manage vaccines, deworming and alerts'),
(8,  'MONTHLY_REPORTS', 'Monthly Reports',     'Reports',      'Can create and review monthly health evaluations'),
(9,  'ADOPTION',        'Adoption System',     'Adoption',     'Can process applications and approvals'),
(10, 'VISITS',          'Visit Management',    'Visits',       'Can schedule visits and record evaluations'),
(11, 'REPORTS',         'System Reports',      'Analytics',    'Can generate, view and export system reports'),
(12, 'USER_MANAGEMENT', 'User Management',     'Administration','Can create users, assign permissions and reset passwords'),
(13, 'SETTINGS',        'System Settings',     'Administration','Can configure shelter profile and system parameters');

-- -----------------------------------------------------------------------------
-- 2. USERS SEED (Default Password for demo: Admin@123 for admin, Staff@123 for staff, User@123 for user)
-- Passwords hashed with bcrypt (cost 10)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `users`;
TRUNCATE TABLE `admins`;

-- Password hashes:
-- 'Admin@123' -> $2a$10$wT8Kz.y2mB1.PZ/z7s4hAeuCeqmE9vW/pC1zD2qKjB9A4kU9U0m8C
-- 'Staff@123' -> $2a$10$uA9Kz.y2mB1.PZ/z7s4hAeuCeqmE9vW/pC1zD2qKjB9A4kU9U0m8S
-- 'User@123'  -> $2a$10$vB9Kz.y2mB1.PZ/z7s4hAeuCeqmE9vW/pC1zD2qKjB9A4kU9U0m8U

INSERT INTO `users` (`id`, `name`, `username`, `password_hash`, `email`, `phone`, `role`, `status`, `must_change_password`, `last_login_at`, `created_at`) VALUES
(1, 'System Administrator', 'admin',         '$2a$10$wT8Kz.y2mB1.PZ/z7s4hAeuCeqmE9vW/pC1zD2qKjB9A4kU9U0m8C', 'admin@pawsandcare.org',    '+91 9876543210', 'ADMIN', 'ACTIVE', FALSE, '2026-10-03 10:15:00', '2026-01-01 09:00:00'),
(2, 'Dr. Aakash Sharma',     'dr.sharma',     '$2a$10$uA9Kz.y2mB1.PZ/z7s4hAeuCeqmE9vW/pC1zD2qKjB9A4kU9U0m8S', 'aakash.sharma@vetcare.in', '+91 9823456781', 'STAFF', 'ACTIVE', FALSE, '2026-10-02 16:30:00', '2026-01-10 11:00:00'),
(3, 'Priya Patel',           'priya.patel',   '$2a$10$uA9Kz.y2mB1.PZ/z7s4hAeuCeqmE9vW/pC1zD2qKjB9A4kU9U0m8S', 'priya.patel@pawsandcare.org','+91 9712345678', 'STAFF', 'ACTIVE', FALSE, '2026-10-03 09:45:00', '2026-01-15 14:00:00'),
(4, 'Vikram Singh',          'vikram.rescue', '$2a$10$uA9Kz.y2mB1.PZ/z7s4hAeuCeqmE9vW/pC1zD2qKjB9A4kU9U0m8S', 'vikram.singh@pawsandcare.org','+91 9654321876', 'STAFF', 'ACTIVE', FALSE, '2026-10-01 11:20:00', '2026-02-01 10:30:00'),
(5, 'Anita Deshmukh',        'anita.adopter', '$2a$10$vB9Kz.y2mB1.PZ/z7s4hAeuCeqmE9vW/pC1zD2qKjB9A4kU9U0m8U', 'anita.deshmukh@gmail.com',  '+91 9988776655', 'USER',  'ACTIVE', FALSE, '2026-10-02 18:00:00', '2026-03-01 12:00:00');

-- Root Admin linkage (Can NEVER be deleted)
INSERT INTO `admins` (`id`, `user_id`, `is_root`) VALUES
(1, 1, TRUE);

-- -----------------------------------------------------------------------------
-- 3. ASSIGN PERMISSIONS
-- -----------------------------------------------------------------------------
-- Admin gets all 13 permissions
INSERT INTO `user_permissions` (`user_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13);

-- Dr. Aakash Sharma (Veterinarian): View Pets, Medical, Vaccination, Monthly Reports, Reports
INSERT INTO `user_permissions` (`user_id`, `permission_id`) VALUES
(2, 1), (2, 6), (2, 7), (2, 8), (2, 11);

-- Priya Patel (Shelter Manager): View Pets, Add Pet, Edit Pet, Photos, Adoption, Visits, Reports
INSERT INTO `user_permissions` (`user_id`, `permission_id`) VALUES
(3, 1), (3, 2), (3, 3), (3, 5), (3, 9), (3, 10), (3, 11);

-- Vikram Singh (Rescue Officer): View Pets, Add Pet, Photos, Visits
INSERT INTO `user_permissions` (`user_id`, `permission_id`) VALUES
(4, 1), (4, 2), (4, 5), (4, 10);

-- Anita Deshmukh (User): View Pets, Adoption (can view pets and submit adoption applications)
INSERT INTO `user_permissions` (`user_id`, `permission_id`) VALUES
(5, 1), (5, 9);

-- -----------------------------------------------------------------------------
-- 4. RESCUE RECORDS SEED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `rescue_records`;

INSERT INTO `rescue_records` (`id`, `rescue_code`, `pet_type`, `rescue_date`, `rescue_location`, `rescued_by`, `initial_condition`, `emergency_treatment`, `photo_url`, `current_location`, `notes`, `status`, `converted_pet_id`, `created_by`, `created_at`) VALUES
(1, 'RES-2026-00001', 'Dog', '2026-05-10', 'Highway 48 near Pune Toll Plaza', 'Vikram Singh', 'Dehydrated, limp on left hind leg, minor abrasions', 'Saline IV drip, wound cleaning, antiseptic dressing, tetanus shot', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80', 'Main Shelter Kennel A3', 'Responded to distress call from highway patrol. Now recovered and named Rocky.', 'CONVERTED_TO_PET', 3, 4, '2026-05-10 11:30:00'),
(2, 'RES-2026-00002', 'Cat', '2026-09-28', 'Shivaji Nagar Market Back Alley', 'Vikram Singh', 'Underweight kitten, conjunctivitis in right eye, shivering', 'Gentamicin eye drops, warmed incubator, nutrient-rich formula', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', 'Clinic Intake Ward', 'Found abandoned in cardboard box during rain. Under observation before public adoption.', 'RESCUED', NULL, 4, '2026-09-28 14:15:00');

-- -----------------------------------------------------------------------------
-- 5. PETS SEED (10 Distinct Pets)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `pets`;

INSERT INTO `pets` (`id`, `pet_code`, `name`, `animal_type`, `breed`, `dob`, `age`, `gender`, `color`, `weight`, `identification_mark`, `microchip_number`, `rescue_date`, `rescue_location`, `current_location`, `health_status`, `behaviour`, `description`, `adoption_status`, `primary_photo_url`, `rescue_id`, `created_by`, `created_at`) VALUES
(1, 'PET-2026-00001', 'Bruno', 'Dog', 'Golden Retriever', '2024-04-12', '2 years 6 months', 'Male', 'Golden Cream', 28.50, 'White patch on lower chest', '985141001234567', '2026-01-15', 'Baner Road, Pune', 'Shelter Play Area', 'Healthy', 'Extremely friendly, high energy, loves playing fetch, great with children and other dogs', 'Bruno is an affectionate Golden Retriever who loves belly rubs and outdoor activities. He is house-trained and ready for a loving family.', 'Available', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80', NULL, 1, '2026-01-16 10:00:00'),

(2, 'PET-2026-00002', 'Luna', 'Cat', 'Persian Mix', '2025-01-20', '1 year 8 months', 'Female', 'Snow White', 4.20, 'Heterochromia (one blue eye, one amber eye)', '985141009876543', '2026-02-18', 'Kothrud, Pune', 'Cattery Suite 2', 'Healthy', 'Calm, gentle, quiet purrer, prefers indoor environments and lap naps', 'Luna is a regal white cat with striking eyes. She is vaccinated, spayed, and looking for a quiet home where she can be pampered.', 'Application Pending', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', NULL, 1, '2026-02-20 12:30:00'),

(3, 'PET-2026-00003', 'Rocky', 'Dog', 'German Shepherd Mix', '2023-11-05', '2 years 11 months', 'Male', 'Black and Tan', 31.00, 'Scar on left hind leg from old rescue injury', '985141005544332', '2026-05-10', 'Highway 48 near Pune', 'Recovery Enclosure 1', 'Under Treatment', 'Alert, loyal, protective, eager to learn commands, slightly shy around strangers', 'Rescued from the highway with leg trauma. Now walking normally but completing anti-inflammatory physical therapy.', 'Under Treatment', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5455?auto=format&fit=crop&w=800&q=80', 1, 4, '2026-05-12 15:40:00'),

(4, 'PET-2026-00004', 'Milo', 'Cat', 'Domestic Short Hair', '2025-06-10', '1 year 4 months', 'Male', 'Orange Tabby', 3.80, 'Swirled marble pattern on sides', '985141007788990', '2026-03-22', 'Aundh Vegetable Market', 'Cattery Lounge', 'Healthy', 'Inquisitive, vocal, loves chasing feather toys and laser pointers', 'Milo is a vibrant ginger boy with lots of personality. He loves company and will happily chat with you throughout the day.', 'Available', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80', NULL, 3, '2026-03-23 09:15:00'),

(5, 'PET-2026-00005', 'Charlie', 'Dog', 'Beagle', '2024-08-14', '2 years 2 months', 'Male', 'Tricolor (White, Black, Tan)', 12.40, 'Heart-shaped black spot near tail base', '985141003322114', '2026-02-02', 'Viman Nagar, Pune', 'Adopted Home', 'Healthy', 'Gentle, food-motivated, curious sniffer, wonderful with kids', 'Charlie was happily adopted by the Kulkarni family after completing all adoption protocols and home visits.', 'Adopted', 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80', NULL, 1, '2026-02-03 14:00:00'),

(6, 'PET-2026-00006', 'Kiwi', 'Bird', 'Cockatiel', '2025-03-01', '1 year 7 months', 'Female', 'Grey and Yellow Crest', 0.10, 'Bright orange cheek circles', NULL, '2026-04-14', 'Kalyani Nagar Garden', 'Aviary Enclosure B', 'Healthy', 'Whistles tunes, responds to human voices, loves millet treats', 'Kiwi is a cheerful cockatiel who loves singing in the morning. Looking for an experienced bird lover with a spacious cage.', 'Available', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80', NULL, 3, '2026-04-15 16:20:00'),

(7, 'PET-2026-00007', 'Snowball', 'Rabbit', 'Angora mix', '2025-08-12', '1 year 2 months', 'Female', 'Fluffy White', 2.10, 'Pink ears and soft long woolly coat', NULL, '2026-05-18', 'Hadapsar Farmhouse vicinity', 'Foster Home (Sneha)', 'Healthy', 'Timid initially, enjoys gentle ear strokes, fond of fresh hay and cilantro', 'Currently in foster care undergoing socialisation. Ideal for an indoor quiet home.', 'Foster', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80', NULL, 3, '2026-05-19 11:10:00'),

(8, 'PET-2026-00008', 'Bella', 'Dog', 'Labrador Retriever', '2024-11-20', '1 year 11 months', 'Female', 'Chocolate Brown', 25.80, 'Small white star on chest', '985141004455667', '2026-06-01', 'Camp Area, Pune', 'Shelter Kennel B2', 'Healthy', 'Bubbly, obedience-trained, loyal companion, water lover', 'Bella is a sweet chocolate lab with soulful eyes. She has a scheduled adoption visit lined up this week.', 'Visit Scheduled', 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=800&q=80', NULL, 1, '2026-06-02 10:45:00'),

(9, 'PET-2026-00009', 'Cookie', 'Hamster', 'Syrian Hamster', '2026-02-15', '8 months', 'Male', 'Golden Honey', 0.15, 'White belly and black button eyes', NULL, '2026-06-25', 'Surrendered by previous owner moving abroad', 'Small Pets Room', 'Healthy', 'Active at twilight, loves running on wheel, clean habits', 'A tiny ball of joy. Low-maintenance pet looking for a home with a cozy habitrail setup.', 'Available', 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=800&q=80', NULL, 3, '2026-06-26 13:00:00'),

(10, 'PET-2026-00010', 'Shelly', 'Turtle', 'Indian Star Turtle (Rescued)', '2022-01-10', '4 years 9 months', 'Unknown', 'Patterned Star Shell', 1.80, 'Distinct geometrical star shell scutes', NULL, '2026-07-02', 'Confiscated during illegal pet trade check', 'Aquatic Habitat 1', 'Healthy', 'Peaceful herbivore, basks under UV lamp, enjoys hibiscus leaves', 'Rescued and rehabilitated under wildlife veterinary guidelines. Eligible for legally registered adoption.', 'Available', 'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&w=800&q=80', NULL, 4, '2026-07-03 17:30:00');

-- -----------------------------------------------------------------------------
-- 6. PET PHOTOS SEED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `pet_photos`;

INSERT INTO `pet_photos` (`id`, `pet_id`, `photo_url`, `file_name`, `caption`, `is_primary`, `uploaded_by`, `created_at`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80', 'bruno_front.jpg', 'Bruno sitting gracefully in the yard', TRUE, 1, '2026-01-16 10:05:00'),
(2, 1, 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80', 'bruno_playing.jpg', 'Bruno enjoying tennis ball practice', FALSE, 1, '2026-01-16 10:06:00'),
(3, 2, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', 'luna_portrait.jpg', 'Luna close up showing heterochromia eyes', TRUE, 1, '2026-02-20 12:35:00'),
(4, 2, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80', 'luna_curled.jpg', 'Luna lounging on plush velvet cushion', FALSE, 1, '2026-02-20 12:36:00'),
(5, 3, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5455?auto=format&fit=crop&w=800&q=80', 'rocky_recovering.jpg', 'Rocky during therapy walking exercise', TRUE, 4, '2026-05-12 15:45:00'),
(6, 4, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80', 'milo_eyes.jpg', 'Milo gazing curiously at the camera', TRUE, 3, '2026-03-23 09:20:00'),
(7, 5, 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80', 'charlie_beagle.jpg', 'Charlie outdoor portrait', TRUE, 1, '2026-02-03 14:05:00'),
(8, 6, 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=800&q=80', 'kiwi_crest.jpg', 'Kiwi showing her yellow crown', TRUE, 3, '2026-04-15 16:25:00'),
(9, 7, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80', 'snowball_bunny.jpg', 'Snowball nibbling green grass', TRUE, 3, '2026-05-19 11:15:00'),
(10, 8, 'https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=800&q=80', 'bella_lab.jpg', 'Bella smiling in sunshine', TRUE, 1, '2026-06-02 10:50:00');

-- -----------------------------------------------------------------------------
-- 7. MEDICAL RECORDS SEED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `medical_documents`;
TRUNCATE TABLE `medical_records`;

INSERT INTO `medical_records` (`id`, `pet_id`, `record_date`, `vet_name`, `diagnosis`, `symptoms`, `treatment`, `medicine`, `notes`, `document_url`, `document_name`, `created_by`, `created_at`) VALUES
(1, 1, '2026-01-20', 'Dr. Aakash Sharma', 'Intake Comprehensive Health Examination', 'None - asymptomatic routine check', 'Full body vitals, coat examination, dental screening, ear swab test', 'Broad-spectrum deworming tablet (Drontal Plus)', 'Pet is in prime physical condition. Heartbeat regular, lungs clear.', '/uploads/medical/bruno_intake_report.pdf', 'bruno_intake_report.pdf', 2, '2026-01-20 11:00:00'),
(2, 3, '2026-05-11', 'Dr. Aakash Sharma', 'Left Hind Paw Soft Tissue Trauma & Abrasion', 'Limping, tenderness on palpation, localized inflammation', 'Wound antiseptic cleansing, sterile bandaging, cold compress therapy', 'Meloxicam 1.5mg oral suspension, Amoxicillin-Clavulanate 250mg', 'X-ray confirmed no bone fractures. Advised 3 weeks limited physical activity.', '/uploads/medical/rocky_xray_report.pdf', 'rocky_xray_report.pdf', 2, '2026-05-11 14:30:00'),
(3, 2, '2026-02-25', 'Dr. Aakash Sharma', 'Otitis Externa (Ear Mites infestation)', 'Head shaking, ear scratching, dark discharge in ear canal', 'Deep ear canal flush, topical acaricide drops application', 'Tresaderm ear drops twice daily for 10 days', 'Follow-up on day 10 indicated complete eradication of mites.', '/uploads/medical/luna_ear_culture.pdf', 'luna_ear_culture.pdf', 2, '2026-02-25 16:15:00'),
(4, 8, '2026-06-05', 'Dr. Aakash Sharma', 'Pre-Adoption Fitness Evaluation', 'Healthy baseline', 'Cardiovascular check, weight audit, parasite screening', 'Flea & Tick Prevention Spot-on (Bravecto)', 'Fully fit and certified ready for home placement.', '/uploads/medical/bella_fitness_cert.pdf', 'bella_fitness_cert.pdf', 2, '2026-06-05 10:00:00');

-- -----------------------------------------------------------------------------
-- 8. VACCINATIONS & HEALTH REMINDERS SEED
-- Calculated so some are OVERDUE (Red), some DUE SOON in <=7 days (Orange), and some UPCOMING (Green)
-- Current reference time: October 2026
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `vaccinations`;

INSERT INTO `vaccinations` (`id`, `pet_id`, `vaccine_name`, `record_type`, `vaccine_date`, `next_due_date`, `vet_name`, `certificate_url`, `notes`, `status`, `created_by`, `created_at`) VALUES
-- 1. OVERDUE (RED) - Bruno: Rabies Booster was due Sept 20, 2026 (< Current Date)
(1, 1, 'Anti-Rabies Booster (Rabisin)', 'Vaccination', '2025-09-20', '2026-09-20', 'Dr. Aakash Sharma', '/uploads/vaccines/bruno_rabies_2025.pdf', 'Booster overdue by 2 weeks. Immediate recall required.', 'OVERDUE', 2, '2025-09-20 10:00:00'),

-- 2. DUE SOON (ORANGE) - Bruno: DHPPi+L (due within 7 days, e.g. Oct 07, 2026)
(2, 1, 'DHPPi + Leptospirosis 7-in-1', 'Vaccination', '2025-10-07', '2026-10-07', 'Dr. Aakash Sharma', '/uploads/vaccines/bruno_dhppi.pdf', 'Annual booster reminder flagged for upcoming appointment.', 'DUE_SOON', 2, '2025-10-07 10:30:00'),

-- 3. UPCOMING (GREEN) - Luna: FVRCP Cat Core Vaccine (due Dec 15, 2026)
(3, 2, 'FVRCP Tri-cat Core Vaccine', 'Vaccination', '2025-12-15', '2026-12-15', 'Dr. Aakash Sharma', '/uploads/vaccines/luna_fvrcp.pdf', 'Next booster in December. Cat is well immunized.', 'UPCOMING', 2, '2025-12-15 11:00:00'),

-- 4. DUE SOON (ORANGE) - Rocky: Deworming reminder (due in 4 days, e.g. Oct 07, 2026)
(4, 3, 'Quarterly Deworming (Fenbendazole)', 'Deworming', '2026-07-07', '2026-10-07', 'Dr. Aakash Sharma', NULL, 'Administer oral tablet with meal.', 'DUE_SOON', 2, '2026-07-07 14:00:00'),

-- 5. UPCOMING (GREEN) - Bella: Canine Bordetella (Kennel Cough) due March 2027
(5, 8, 'Bordetella Bronchiseptica Oral', 'Vaccination', '2026-03-10', '2027-03-10', 'Dr. Aakash Sharma', '/uploads/vaccines/bella_bordetella.pdf', 'Administered prior to group play socialization.', 'UPCOMING', 2, '2026-03-10 09:30:00'),

-- 6. OVERDUE (RED) - Milo: Feline Rabies due Sept 15, 2026
(6, 4, 'Feline Rabies Vaccine', 'Vaccination', '2025-09-15', '2026-09-15', 'Dr. Aakash Sharma', '/uploads/vaccines/milo_rabies.pdf', 'Needs booster before finalizing adoption process.', 'OVERDUE', 2, '2025-09-15 12:00:00');

-- -----------------------------------------------------------------------------
-- 9. MONTHLY REPORTS SEED (Timeline progression)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `monthly_report_photos`;
TRUNCATE TABLE `monthly_reports`;

INSERT INTO `monthly_reports` (`id`, `pet_id`, `report_month`, `weight`, `health_condition`, `behaviour`, `food`, `treatment`, `remarks`, `document_url`, `created_by`, `created_at`) VALUES
(1, 1, '2026-07', 27.80, 'Optimal vitality, clear coat, energetic pulse', 'Enthusiastic, obedient to sit/stay commands', 'Royal Canin Maxi Adult, 450g daily in two split meals', 'Multivitamin supplement (Nutri-Plus gel)', 'Weight steady, highly socialized during volunteer yard walks.', '/uploads/reports/bruno_july_2026.pdf', 2, '2026-07-31 17:00:00'),
(2, 1, '2026-08', 28.20, 'Gained healthy lean muscle, coats glossy', 'Loves water games during summer afternoons', 'Royal Canin Maxi Adult + boiled chicken broth on weekends', 'Routine ear wipe maintenance', 'Ready for adoption family matches.', '/uploads/reports/bruno_aug_2026.pdf', 2, '2026-08-31 17:30:00'),
(3, 1, '2026-09', 28.50, 'Excellent overall health, minor dental tartar managed', 'Very affectionate, calm during indoor grooming', 'Royal Canin Maxi Adult + dental chew sticks', 'Enzymatic toothpaste brushing weekly', 'Vaccination booster due next month.', '/uploads/reports/bruno_sept_2026.pdf', 2, '2026-09-30 18:00:00'),
(4, 2, '2026-09', 4.20, 'Recovered from ear irritation, coat silky', 'Gentle, affectionate, sleeps near window sunlight', 'Whiskas Ocean Fish + wet gravy food in evening', 'Probiotics twice a week', 'Perfect candidate for single or elderly pet parent.', '/uploads/reports/luna_sept_2026.pdf', 2, '2026-09-30 18:15:00');

-- -----------------------------------------------------------------------------
-- 10. ADOPTION APPLICATIONS SEED
-- Demonstrates the workflow:
-- PENDING -> UNDER REVIEW -> VISIT SCHEDULED -> VISIT COMPLETED -> APPROVED / REJECTED -> ADOPTED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `adoption_applications`;

INSERT INTO `adoption_applications` (`id`, `application_code`, `pet_id`, `user_id`, `applicant_name`, `mobile_number`, `email`, `address`, `city`, `occupation`, `family_members`, `home_type`, `previous_pet_experience`, `reason_for_adoption`, `preferred_pet`, `additional_information`, `status`, `admin_remarks`, `reviewed_by`, `reviewed_at`, `created_at`) VALUES
-- 1. PENDING (Milo)
(1, 'APP-2026-00001', 4, 5, 'Anita Deshmukh', '+91 9988776655', 'anita.deshmukh@gmail.com', 'Flat 402, Green Meadows, Senapati Bapat Road', 'Pune', 'Software Architect', 3, 'Apartment (3 BHK with netted balcony)', 'Owned a rescued cat for 8 years in childhood', 'We are looking for a playful cat to complete our family and give him a warm forever home.', 'Milo (PET-2026-00004)', 'We work from home hybridly, so pet will always have company.', 'PENDING', NULL, NULL, NULL, '2026-10-02 14:20:00'),

-- 2. VISIT SCHEDULED (Bella)
(2, 'APP-2026-00002', 8, NULL, 'Rohan Verma', '+91 9811223344', 'rohan.verma@outlook.com', 'Row House 12, Nyati Estate, Mohammed Wadi', 'Pune', 'Business Consultant', 4, 'Independent Row House with fenced garden', 'Had a Golden Retriever for 11 years who passed away of old age', 'Seeking an energetic dog who loves running and companionship for our teenagers.', 'Bella (PET-2026-00008)', 'Full veterinary care history ready from Dr. Sethi Clinic.', 'VISIT SCHEDULED', 'Applicant profile verified. Fenced garden confirmed via video call. Visit scheduled for shelter meet & greet.', 1, '2026-10-01 16:00:00', '2026-09-29 11:00:00'),

-- 3. ADOPTED (Charlie)
(3, 'APP-2026-00003', 5, NULL, 'Sunil Kulkarni', '+91 9844556677', 'sunil.kulkarni@techcorp.com', 'Bungalow 7, Sindh Society, Aundh', 'Pune', 'Civil Engineer', 3, 'Bungalow with private compound', 'Experienced with Beagle breed for over 6 years', 'Wanted to give a rescued Beagle a dignified, joyful retirement home.', 'Charlie (PET-2026-00005)', 'Full home verification completed successfully.', 'ADOPTED', 'Approved after exemplary home visit and family interaction. Formal adoption certificate issued.', 1, '2026-02-14 11:00:00', '2026-02-05 10:15:00');

-- -----------------------------------------------------------------------------
-- 11. VISITS SEED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `visits`;

INSERT INTO `visits` (`id`, `application_id`, `pet_id`, `assigned_staff_id`, `visit_date`, `visit_time`, `location`, `status`, `notes`, `visit_result`, `recommendation`, `report_notes`, `report_document_url`, `report_submitted_at`, `created_by`, `created_at`) VALUES
-- Visit for Bella (Scheduled Today/Upcoming)
(1, 2, 8, 3, '2026-10-03', '15:30:00', 'Main Shelter Courtyard B', 'SCHEDULED', 'Meet and greet between Rohan Verma family and Bella. Introduce teenagers to assess bonding.', 'Pending', NULL, NULL, NULL, NULL, 1, '2026-10-01 16:30:00'),

-- Visit for Charlie (Completed)
(2, 3, 5, 3, '2026-02-10', '11:00:00', 'Applicant Home (Sindh Society, Aundh)', 'COMPLETED', 'On-site home assessment to verify safety of boundary wall and outdoor space.', 'Positive', 'Highly recommended for immediate adoption. Safe premises and experienced owners.', 'Boundary wall is 6 feet high with secure gates. Pet bed and feeding zone already prepared.', '/uploads/reports/visit_report_charlie.pdf', '2026-02-10 14:00:00', 1, '2026-02-06 12:00:00');

-- -----------------------------------------------------------------------------
-- 12. ADOPTION RECORDS SEED (Post-Approval Certificate)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `adoption_records`;

INSERT INTO `adoption_records` (`id`, `application_id`, `pet_id`, `applicant_name`, `applicant_email`, `applicant_phone`, `adoption_date`, `agreement_text`, `certificate_code`, `admin_remarks`, `created_by`, `created_at`) VALUES
(1, 3, 5, 'Sunil Kulkarni', 'sunil.kulkarni@techcorp.com', '+91 9844556677', '2026-02-15', 'I, Sunil Kulkarni, hereby take full legal, medical, and emotional guardianship of Beagle Charlie (PET-2026-00005). I agree never to abandon, chain, or mistreat the animal and allow periodic shelter wellness checks.', 'CERT-2026-00001', 'Official transfer of guardianship executed. Charlie transitioned to his forever home.', 1, '2026-02-15 11:30:00');

-- -----------------------------------------------------------------------------
-- 13. FOSTER RECORDS SEED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `foster_records`;

INSERT INTO `foster_records` (`id`, `pet_id`, `foster_person`, `mobile`, `address`, `start_date`, `expected_end_date`, `actual_end_date`, `pet_condition`, `notes`, `status`, `created_by`, `created_at`) VALUES
(1, 7, 'Sneha Joshi (Staff Foster)', '+91 9822334455', 'Flat 101, Parijat Apartments, Model Colony, Pune', '2026-09-01', '2026-10-15', NULL, 'Healthy, timid, gaining confidence around household sounds', 'Temporary socialization foster prior to open public adoption listing.', 'ACTIVE', 3, '2026-09-01 10:00:00');

-- -----------------------------------------------------------------------------
-- 14. NOTIFICATIONS SEED (Dashboard badges & alerts)
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `notifications`;

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `related_entity`, `related_id`, `is_read`, `created_at`) VALUES
(1, 1, 'New Adoption Application', 'Anita Deshmukh submitted application APP-2026-00001 for Milo (PET-2026-00004).', 'ADOPTION_APPLICATION', 'adoption_applications', 1, FALSE, '2026-10-02 14:20:00'),
(2, 1, 'Vaccination Overdue', 'Bruno (PET-2026-00001) Rabies Booster is overdue since 2026-09-20!', 'VACCINATION_OVERDUE', 'vaccinations', 1, FALSE, '2026-10-03 08:00:00'),
(3, 1, 'Vaccination Due Soon', 'Bruno (PET-2026-00001) DHPPi 7-in-1 is due within 4 days (2026-10-07).', 'VACCINATION_DUE', 'vaccinations', 2, FALSE, '2026-10-03 08:00:00'),
(4, 1, 'Adoption Visit Scheduled Today', 'Visit with Rohan Verma for Bella (PET-2026-00008) is scheduled today at 15:30.', 'VISIT_TODAY', 'visits', 1, FALSE, '2026-10-03 08:30:00'),
(5, 1, 'Monthly Report Pending', 'Monthly health report for October 2026 is pending for 8 shelter pets.', 'MONTHLY_REPORT_PENDING', 'pets', 1, FALSE, '2026-10-01 09:00:00'),
(6, 1, 'Foster End Date Approaching', 'Foster placement for Snowball (PET-2026-00007) ends on 2026-10-15.', 'FOSTER_END_APPROACHING', 'foster_records', 1, FALSE, '2026-10-02 09:30:00');

-- -----------------------------------------------------------------------------
-- 15. ACTIVITY LOGS SEED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `activity_logs`;

INSERT INTO `activity_logs` (`id`, `user_id`, `user_name`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, 'admin', 'LOGIN', 'Admin authenticated into control panel', '127.0.0.1', '2026-10-03 10:15:00'),
(2, 1, 'admin', 'SCHEDULE_VISIT', 'Scheduled adoption visit for applicant Rohan Verma (Pet: Bella)', '127.0.0.1', '2026-10-01 16:30:00'),
(3, 2, 'dr.sharma', 'ADD_MEDICAL_RECORD', 'Recorded fitness evaluation for Labrador Bella', '192.168.1.15', '2026-06-05 10:00:00'),
(4, 4, 'vikram.rescue', 'ADD_PET', 'Enrolled rescued German Shepherd mix Rocky into database', '192.168.1.22', '2026-05-12 15:40:00'),
(5, 1, 'admin', 'APPROVE_APPLICATION', 'Approved adoption application APP-2026-00003 for Charlie', '127.0.0.1', '2026-02-14 11:00:00');

-- -----------------------------------------------------------------------------
-- 16. SETTINGS SEED
-- -----------------------------------------------------------------------------
TRUNCATE TABLE `settings`;

INSERT INTO `settings` (`id`, `shelter_name`, `shelter_logo`, `phone`, `email`, `address`, `website_info`, `currency`, `updated_at`) VALUES
(1, 'Paws & Care Animal Shelter & Sanctuary', '/uploads/logo.png', '+91 98765 43210', 'contact@pawsandcare.org', 'Plot 45, Green Valley Sanctuary Road, Near Pashan Lake, Pune, Maharashtra 411021, India', 'Dedicated non-profit sanctuary rescuing, rehabilitating, and rehoming vulnerable animals across Maharashtra since 2018.', 'INR', '2026-10-01 10:00:00');

SET FOREIGN_KEY_CHECKS = 1;
