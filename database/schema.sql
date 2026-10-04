-- =============================================================================
-- DATABASE SCHEMA: PET ADOPTION AND MANAGEMENT SYSTEM
-- BCA FINAL YEAR PROJECT
-- Technology Stack: MySQL 8.0+ / MariaDB
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `pet_adoption_system` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `pet_adoption_system`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(50) NULL,
  `role` ENUM('ADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'STAFF',
  `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
  `must_change_password` BOOLEAN NOT NULL DEFAULT FALSE,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. ADMINS TABLE (Guarantees root admin protection)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `is_root` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_admins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. PERMISSIONS TABLE (13 Core Modules)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. USER PERMISSIONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `user_permissions`;
CREATE TABLE `user_permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  `granted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_permission` (`user_id`, `permission_id`),
  CONSTRAINT `fk_up_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_up_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. RESCUE RECORDS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `rescue_records`;
CREATE TABLE `rescue_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rescue_code` VARCHAR(50) NOT NULL UNIQUE,
  `pet_type` ENUM('Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Turtle', 'Fish', 'Other') NOT NULL,
  `rescue_date` DATE NOT NULL,
  `rescue_location` VARCHAR(255) NOT NULL,
  `rescued_by` VARCHAR(150) NOT NULL,
  `initial_condition` TEXT NOT NULL,
  `emergency_treatment` TEXT NULL,
  `photo_url` VARCHAR(500) NULL,
  `current_location` VARCHAR(255) NOT NULL DEFAULT 'Clinic Intake',
  `notes` TEXT NULL,
  `status` ENUM('RESCUED', 'CONVERTED_TO_PET', 'TRANSFERRED', 'DECEASED') NOT NULL DEFAULT 'RESCUED',
  `converted_pet_id` INT NULL,
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_rescue_status` (`status`),
  INDEX `idx_rescue_date` (`rescue_date`),
  CONSTRAINT `fk_rescue_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. PETS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `pets`;
CREATE TABLE `pets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `animal_type` ENUM('Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Turtle', 'Fish', 'Other') NOT NULL,
  `breed` VARCHAR(100) NOT NULL,
  `dob` DATE NULL,
  `age` VARCHAR(50) NULL,
  `gender` ENUM('Male', 'Female', 'Unknown') NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `weight` DECIMAL(5,2) NULL,
  `identification_mark` VARCHAR(255) NULL,
  `microchip_number` VARCHAR(100) NULL,
  `rescue_date` DATE NULL,
  `rescue_location` VARCHAR(255) NULL,
  `current_location` VARCHAR(255) NOT NULL DEFAULT 'Main Shelter',
  `health_status` ENUM('Healthy', 'Under Treatment', 'Critical', 'Recovering', 'Special Needs') NOT NULL DEFAULT 'Healthy',
  `behaviour` TEXT NULL,
  `description` TEXT NULL,
  `adoption_status` ENUM('Available', 'Application Pending', 'Visit Scheduled', 'Foster', 'Under Treatment', 'Adopted', 'Not Available') NOT NULL DEFAULT 'Available',
  `primary_photo_url` VARCHAR(500) NULL,
  `rescue_id` INT NULL,
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pets_status` (`adoption_status`),
  INDEX `idx_pets_type` (`animal_type`),
  INDEX `idx_pets_breed` (`breed`),
  INDEX `idx_pets_health` (`health_status`),
  CONSTRAINT `fk_pets_rescue` FOREIGN KEY (`rescue_id`) REFERENCES `rescue_records` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pets_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. PET PHOTOS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `pet_photos`;
CREATE TABLE `pet_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `photo_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `caption` VARCHAR(255) NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
  `uploaded_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_photos_pet` (`pet_id`),
  CONSTRAINT `fk_photos_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_photos_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. MEDICAL RECORDS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE `medical_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `record_date` DATE NOT NULL,
  `vet_name` VARCHAR(150) NOT NULL,
  `diagnosis` VARCHAR(255) NOT NULL,
  `symptoms` TEXT NULL,
  `treatment` TEXT NOT NULL,
  `medicine` TEXT NULL,
  `notes` TEXT NULL,
  `document_url` VARCHAR(500) NULL,
  `document_name` VARCHAR(255) NULL,
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_med_pet` (`pet_id`),
  INDEX `idx_med_date` (`record_date`),
  CONSTRAINT `fk_med_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_med_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. MEDICAL DOCUMENTS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `medical_documents`;
CREATE TABLE `medical_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `medical_record_id` INT NOT NULL,
  `document_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_docs_record` (`medical_record_id`),
  CONSTRAINT `fk_docs_med` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. VACCINATIONS & HEALTH REMINDERS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `vaccinations`;
CREATE TABLE `vaccinations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `vaccine_name` VARCHAR(150) NOT NULL,
  `record_type` ENUM('Vaccination', 'Deworming', 'Vet Check-up', 'Medicine Reminder', 'Other Health Reminder') NOT NULL DEFAULT 'Vaccination',
  `vaccine_date` DATE NOT NULL,
  `next_due_date` DATE NOT NULL,
  `vet_name` VARCHAR(150) NOT NULL,
  `certificate_url` VARCHAR(500) NULL,
  `notes` TEXT NULL,
  `status` ENUM('UPCOMING', 'DUE_SOON', 'OVERDUE', 'COMPLETED') NOT NULL DEFAULT 'UPCOMING',
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_vac_pet` (`pet_id`),
  INDEX `idx_vac_next_due` (`next_due_date`),
  INDEX `idx_vac_status` (`status`),
  CONSTRAINT `fk_vac_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vac_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. MONTHLY REPORTS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `monthly_reports`;
CREATE TABLE `monthly_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `report_month` VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  `weight` DECIMAL(5,2) NOT NULL,
  `health_condition` TEXT NOT NULL,
  `behaviour` TEXT NOT NULL,
  `food` TEXT NOT NULL,
  `treatment` TEXT NULL,
  `remarks` TEXT NULL,
  `document_url` VARCHAR(500) NULL,
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_pet_month` (`pet_id`, `report_month`),
  INDEX `idx_mr_month` (`report_month`),
  CONSTRAINT `fk_mr_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mr_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. MONTHLY REPORT PHOTOS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `monthly_report_photos`;
CREATE TABLE `monthly_report_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `monthly_report_id` INT NOT NULL,
  `photo_url` VARCHAR(500) NOT NULL,
  `caption` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_mrp_report` (`monthly_report_id`),
  CONSTRAINT `fk_mrp_report` FOREIGN KEY (`monthly_report_id`) REFERENCES `monthly_reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. ADOPTION APPLICATIONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `adoption_applications`;
CREATE TABLE `adoption_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_code` VARCHAR(50) NOT NULL UNIQUE,
  `pet_id` INT NOT NULL,
  `user_id` INT NULL,
  `applicant_name` VARCHAR(150) NOT NULL,
  `mobile_number` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `occupation` VARCHAR(100) NOT NULL,
  `family_members` INT NOT NULL DEFAULT 1,
  `home_type` VARCHAR(100) NOT NULL,
  `previous_pet_experience` TEXT NULL,
  `reason_for_adoption` TEXT NOT NULL,
  `preferred_pet` VARCHAR(100) NULL,
  `additional_information` TEXT NULL,
  `status` ENUM('PENDING', 'UNDER REVIEW', 'VISIT SCHEDULED', 'VISIT COMPLETED', 'APPROVED', 'REJECTED', 'ADOPTED') NOT NULL DEFAULT 'PENDING',
  `admin_remarks` TEXT NULL,
  `reviewed_by` INT NULL,
  `reviewed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_app_pet` (`pet_id`),
  INDEX `idx_app_user` (`user_id`),
  INDEX `idx_app_status` (`status`),
  CONSTRAINT `fk_app_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_app_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. VISITS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `visits`;
CREATE TABLE `visits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL,
  `pet_id` INT NOT NULL,
  `assigned_staff_id` INT NULL,
  `visit_date` DATE NOT NULL,
  `visit_time` TIME NOT NULL,
  `location` VARCHAR(255) NOT NULL DEFAULT 'Main Shelter Meeting Room',
  `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
  `notes` TEXT NULL,
  `visit_result` ENUM('Positive', 'Neutral', 'Negative', 'Pending') NOT NULL DEFAULT 'Pending',
  `recommendation` TEXT NULL,
  `report_notes` TEXT NULL,
  `report_document_url` VARCHAR(500) NULL,
  `report_submitted_at` DATETIME NULL,
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_visits_app` (`application_id`),
  INDEX `idx_visits_pet` (`pet_id`),
  INDEX `idx_visits_date` (`visit_date`),
  INDEX `idx_visits_status` (`status`),
  CONSTRAINT `fk_visits_app` FOREIGN KEY (`application_id`) REFERENCES `adoption_applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_visits_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_visits_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_visits_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. ADOPTION RECORDS TABLE (Post-Approval Certificate & Agreement)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `adoption_records`;
CREATE TABLE `adoption_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `application_id` INT NOT NULL UNIQUE,
  `pet_id` INT NOT NULL,
  `applicant_name` VARCHAR(150) NOT NULL,
  `applicant_email` VARCHAR(150) NOT NULL,
  `applicant_phone` VARCHAR(30) NOT NULL,
  `adoption_date` DATE NOT NULL,
  `agreement_text` TEXT NOT NULL,
  `certificate_code` VARCHAR(50) NOT NULL UNIQUE,
  `admin_remarks` TEXT NULL,
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ar_pet` (`pet_id`),
  CONSTRAINT `fk_ar_app` FOREIGN KEY (`application_id`) REFERENCES `adoption_applications` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ar_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ar_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. FOSTER RECORDS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `foster_records`;
CREATE TABLE `foster_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT NOT NULL,
  `foster_person` VARCHAR(150) NOT NULL,
  `mobile` VARCHAR(30) NOT NULL,
  `address` TEXT NOT NULL,
  `start_date` DATE NOT NULL,
  `expected_end_date` DATE NOT NULL,
  `actual_end_date` DATE NULL,
  `pet_condition` TEXT NOT NULL,
  `notes` TEXT NULL,
  `status` ENUM('ACTIVE', 'RETURNED', 'ADOPTED_BY_FOSTER', 'TRANSFERRED') NOT NULL DEFAULT 'ACTIVE',
  `created_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_foster_pet` (`pet_id`),
  INDEX `idx_foster_status` (`status`),
  CONSTRAINT `fk_foster_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_foster_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 17. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL, -- NULL indicates notification for all admins / broadcast
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('ADOPTION_APPLICATION', 'VACCINATION_DUE', 'VACCINATION_OVERDUE', 'VISIT_TODAY', 'MONTHLY_REPORT_PENDING', 'FOSTER_END_APPROACHING', 'GENERAL') NOT NULL,
  `related_entity` VARCHAR(50) NULL,
  `related_id` INT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_user` (`user_id`),
  INDEX `idx_notif_read` (`is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 18. ACTIVITY LOGS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(50) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_logs_action` (`action`),
  INDEX `idx_logs_user` (`user_id`),
  INDEX `idx_logs_time` (`created_at`),
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 19. SETTINGS TABLE
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shelter_name` VARCHAR(150) NOT NULL DEFAULT 'Paws & Care Animal Shelter',
  `shelter_logo` VARCHAR(500) NULL,
  `phone` VARCHAR(50) NOT NULL DEFAULT '+91 98765 43210',
  `email` VARCHAR(150) NOT NULL DEFAULT 'contact@pawsandcare.org',
  `address` TEXT NOT NULL,
  `website_info` TEXT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
