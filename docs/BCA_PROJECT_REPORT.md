# BACHELOR OF COMPUTER APPLICATIONS (BCA) - FINAL YEAR PROJECT REPORT
## SYSTEM REQUIREMENTS SPECIFICATION & ARCHITECTURAL DESIGN REPORT

---

# PROJECT TITLE: PET ADOPTION AND MANAGEMENT SYSTEM

**Academic Year:** 2025 – 2026  
**Course:** Bachelor of Computer Applications (BCA) – Semester VI  
**Project Category:** Full-Stack Web Application (Tier-3 Enterprise Architecture)  
**Target Domain:** Animal Shelter Administration, Veterinary Healthcare & Public Adoption  

---

## TABLE OF CONTENTS
1. [Abstract & Executive Summary](#1-abstract--executive-summary)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Project Objectives](#4-project-objectives)
5. [Analysis of Existing System vs. Proposed System](#5-analysis-of-existing-system-vs-proposed-system)
6. [Scope of the Project](#6-scope-of-the-project)
7. [Feasibility Study](#7-feasibility-study)
   - 7.1 Technical Feasibility
   - 7.2 Economic Feasibility
   - 7.3 Operational Feasibility
8. [Hardware & Software Requirements](#8-hardware--software-requirements)
9. [Functional Requirements (SRS)](#9-functional-requirements-srs)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [System Architecture](#11-system-architecture)
12. [Data Flow Diagrams (DFD)](#12-data-flow-diagrams-dfd)
    - 12.1 DFD Level 0 (Context Level Diagram)
    - 12.2 DFD Level 1 (Macro Process Flow)
    - 12.3 DFD Level 2 (Adoption & Clinical Sub-systems)
13. [Entity-Relationship (ER) Diagram Description](#13-entity-relationship-er-diagram-description)
14. [Database Design & Data Dictionary](#14-database-design--data-dictionary)
15. [Detailed Module Specifications](#15-detailed-module-specifications)
16. [Security & Authentication Architecture](#16-security--authentication-architecture)
17. [Software Testing & Quality Assurance](#17-software-testing--quality-assurance)
    - 17.1 Test Strategy
    - 17.2 Formal Test Cases Table
18. [Future Scope & Enhancements](#18-future-scope--enhancements)
19. [Conclusion](#19-conclusion)
20. [BCA Viva-Voce Comprehensive Preparation Guide (Q&A)](#20-bca-viva-voce-comprehensive-preparation-guide-qa)

---

## 1. ABSTRACT & EXECUTIVE SUMMARY

The **Pet Adoption and Management System** is an enterprise-grade full-stack web application engineered to solve the operational bottlenecks of animal shelters, non-profit rescue sanctuaries, and veterinary clinics. Historically, animal shelters have struggled with fragmented paper logbooks, uncoordinated immunization tracking, lack of screening in adoption workflows, and zero central accountability for animal health records.

This project delivers a multi-role, responsive web platform utilizing a **React.js + Tailwind CSS** frontend, a scalable **Node.js + Express.js** RESTful API micro-tier, and a normalized **MySQL** relational database engine. The system enforces strict Role-Based Access Control (RBAC) across 13 modular permissions, automated dynamic calculation of vaccination urgency (Green/Orange/Red alerts), longitudinal monthly animal development tracking, emergency rescue intake-to-adoption transition, foster home oversight, applicant screening pipelines, on-site visit audits, and automated issuance of cryptographic adoption certificates.

---

## 2. INTRODUCTION

The domestication and welfare of companion animals represent a cornerstone of humane urban societies. However, stray animal overpopulation, abandonment, and vehicular accidents impose an overwhelming burden on voluntary rescue foundations and municipal animal hospitals.

Traditional shelter operations are manual, leading to:
- Overdue rabies and core vaccinations due to forgotten physical diary cards.
- Loss of medical records across different visiting veterinary surgeons.
- Absence of background verification for adoptive parents, leading to repeat abandonment.
- Inability of administrators to audit daily employee actions or generate compliance reports.

The **Pet Adoption and Management System** transitions animal rescue facilities into digital sanctuaries by automating census intake, clinical record preservation, adoption pipeline status transitions, and public awareness.

---

## 3. PROBLEM STATEMENT

Manual animal shelter administration suffers from critical systemic vulnerabilities:
1. **Clinical Data Attrition:** Paper vaccination cards and treatment prescriptions are easily lost, soiled, or damaged, compromising continuity of care.
2. **Delayed Immunization:** Core vaccines (Rabies, DHPPi, FVRCP) require strict annual and booster schedules. Without dynamic date computation, animals lapse into overdue vulnerability.
3. **Adoption Black Markets & Irresponsible Guardianship:** Lacking a structured application screening and home-visit audit process, shelters risk releasing traumatized animals to unfit households.
4. **Disorganized Foster Placements:** Animals placed in temporary foster homes frequently disappear from active shelter census tracking when expected return dates lapse without reminders.
5. **Absence of Role-Level Accountability:** Staff members have unchecked access to records, with no cryptographic logging of who updated diagnoses or altered inventory states.

---

## 4. PROJECT OBJECTIVES

The primary engineering objectives of this project are:
1. **Automated Pet Lifecycle Tracking:** Assign every admitted animal a unique, collision-proof ID (`PET-YYYY-XXXXX`) and manage records across seven life states (`Available`, `Application Pending`, `Visit Scheduled`, `Foster`, `Under Treatment`, `Adopted`, `Not Available`).
2. **Real-time Preventative Medical Alerts:** Dynamically calculate vaccination deadlines into three distinct visual categories:
   - **GREEN (Upcoming):** Due in > 7 days.
   - **ORANGE (Due Soon):** Due within 7 days.
   - **RED (Overdue):** Past scheduled date, demanding immediate clinical intervention.
3. **Multi-Stage Adoption Workflow:** Model a multi-gate screening pipeline:
   $$\text{PENDING} \longrightarrow \text{UNDER REVIEW} \longrightarrow \text{VISIT SCHEDULED} \longrightarrow \text{VISIT COMPLETED} \longrightarrow \text{APPROVED/REJECTED} \longrightarrow \text{ADOPTED}$$
4. **Rescue-to-Pet Integration:** Allow emergency field rescues to be logged with GPS landmarks and initial trauma care, with a 1-click transformation into formal adoptable profiles.
5. **Granular 13-Module Permission Matrix:** Restrict staff capabilities to assigned functional roles (e.g., Veterinarians access medical records but cannot delete users or alter financial shelter settings).
6. **Data Integrity & Exportability:** Provide 9 analytical reports with real-time on-screen preview, CSV data streaming, and print-ready CSS formatting.

---

## 5. ANALYSIS OF EXISTING SYSTEM VS. PROPOSED SYSTEM

| Feature / Dimension | Existing Manual / Spreadsheet System | Proposed Pet Adoption & Management System |
| :--- | :--- | :--- |
| **Data Storage** | Physical registers, notebooks, Excel sheets | Normalized MySQL relational database with foreign keys |
| **Authentication** | None, or shared single Excel password | Bcrypt salted hashing (10 rounds) + JWT bearer tokens |
| **Access Control** | Unrestricted; anyone can delete rows | 13-module permission matrix enforced at API & UI levels |
| **Vaccine Alerts** | Manual date calculation from notebook logs | Dynamic real-time calculation with color badges (Green/Orange/Red) |
| **Adoption Workflow**| Verbal inquiries, unrecorded phone calls | 6-stage structured pipeline with audit remarks & visits |
| **Public Transparency**| Word of mouth, social media posts | Sanitized public catalog hiding private clinical and applicant data |
| **Foster Tracking** | Forgotten temporary placements | Automated return notifications and duration tracking |
| **Audit Trail** | No activity logging | Automated user, action, timestamp, and IP tracking |
| **Report Generation**| Manual compilation taking days | 1-click printable PDF layouts & instant CSV downloads |

---

## 6. SCOPE OF THE PROJECT

### In-Scope Functional Modules:
- Public discovery landing page and responsive adoptable pets catalog.
- Secure authentication engine with Root Admin protection.
- Pet profile management with multiple photo galleries and primary photo selection.
- Clinical medical logbook with document attachment links.
- Immunization scheduler with overdue alerts and deworming reminders.
- Longitudinal monthly weight, diet, and progress evaluations with timeline charts.
- Adoption application intake, review, home visit coordination, and certificate issuance.
- Foster care placement duration tracker.
- Field emergency rescue intake logbook with 1-click pet conversion.
- Administrator control panel with 10 live KPI cards, Recharts visualizations, and audit trails.

### Out-of-Scope (Deliberate Design Boundaries):
- Public self-registration (all staff and users are provisioned by Administrator to prevent spam).
- Direct peer-to-peer user sales or pet trading (strictly no-kill shelter management).

---

## 7. FEASIBILITY STUDY

### 7.1 Technical Feasibility
- **Frontend:** React.js provides virtual DOM reconciliation for snappy UI re-renders, while Tailwind CSS guarantees responsive utility styling across mobile, tablet, and desktop screens.
- **Backend:** Node.js event-driven non-blocking I/O efficiently manages concurrent requests and Multer file uploads.
- **Database:** MySQL 8.0 natively enforces relational ACID transactions, foreign key cascading constraints, and indexing over high-frequency lookup fields.
- **Conclusion:** The project is 100% technically feasible using modern open-source software libraries.

### 7.2 Economic Feasibility
- The system is built entirely on zero-cost, open-source software (Node.js, Express, React, MySQL, Tailwind CSS).
- Does not mandate proprietary runtime licenses or recurring cloud subscriptions.
- Can be self-hosted on cost-effective Linux virtual private servers or on-premises shelter computers.
- **Conclusion:** Highly economically viable with negligible recurring cost.

### 7.3 Operational Feasibility
- Intuitive, modern design with clear semantic indicators, empty states, and modal dialogs.
- Eliminates human error in date arithmetic through automated vaccine status classification.
- **Conclusion:** Staff members require minimal computer literacy to operate the system smoothly.

---

## 8. HARDWARE & SOFTWARE REQUIREMENTS

### 8.1 Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher (2.0 GHz+).
- **RAM:** Minimum 4 GB (8 GB recommended for concurrent Node & Vite development).
- **Storage:** 500 MB free hard disk space for application source code, assets, and database.
- **Display:** 1024x768 minimum resolution (fully responsive up to 4K displays).
- **Network Interface:** Standard 10/100/1000 Mbps Ethernet or Wi-Fi adapter.

### 8.2 Software Requirements
- **Operating System:** Cross-platform (Windows 10/11, Ubuntu 20.04/22.04 LTS, or macOS).
- **Runtime Environment:** Node.js (v18.x or v20.x LTS) with NPM (v9.x or higher).
- **Database Server:** MySQL Server 8.0+ or MariaDB 10.5+ (or XAMPP / WAMP stack).
- **Web Browser:** Google Chrome 100+, Mozilla Firefox 100+, Microsoft Edge, or Safari.
- **Development Tools:** Visual Studio Code, Postman, MySQL Workbench.

---

## 9. FUNCTIONAL REQUIREMENTS (SRS)

1. **REQ-01: Authentication & Root Admin Inviolability**
   - The system shall authenticate users via username and bcrypt-hashed passwords.
   - The Root Administrator account (`is_root = 1`) must never be deletable or disableable.
2. **REQ-02: Granular Role-Based Access Control**
   - The system shall provide 13 permission codes.
   - Middleware shall intercept all restricted API endpoints and return HTTP 403 Forbidden if the user lacks the specific permission.
3. **REQ-03: Unique Pet ID Generation**
   - The system shall automatically generate pet codes formatted as `PET-YYYY-XXXXX`.
4. **REQ-04: Photo Gallery & Primary Thumbnail**
   - The system shall support multiple uploaded photo assets per pet, allow assigning a primary profile image, and support deletion.
5. **REQ-05: Dynamic Immunization Status Calculation**
   - Status must be dynamically computed based on `next_due_date` compared to current system wall-clock date.
6. **REQ-06: Longitudinal Monthly Progress Timeline**
   - Historical monthly reports (`YYYY-MM`) must be immutable and chronologically ordered without overwriting past entries.
7. **REQ-07: Structured Adoption Approval Lifecycle**
   - Applications must advance sequentially: Pending $\rightarrow$ Under Review $\rightarrow$ Visit Scheduled $\rightarrow$ Visit Completed $\rightarrow$ Approved $\rightarrow$ Adopted.
   - Approval shall automatically update pet status to `Adopted` and issue a verifiable certificate code (`CERT-YYYY-XXXXX`).
8. **REQ-08: Emergency Rescue Intake & Conversion**
   - Field rescues must be recorded with location and trauma condition, supporting 1-click creation of a formal pet profile.

---

## 10. NON-FUNCTIONAL REQUIREMENTS

- **Security:** Password storage using salted bcrypt hashing; stateless API authentication via signed JWTs; SQL injection protection via parameterized queries; sanitize public endpoints to prevent leakage of private medical records or applicant residential addresses.
- **Performance:** Sub-100ms API response time for cached and indexed queries; client-side bundle size optimized via Vite tree-shaking.
- **Reliability & Availability:** Database operations wrapped in transactions; automatic fallback relational storage mechanism to prevent unhandled process crashes.
- **Usability:** High-contrast professional palette (white background, teal/emerald accents `#0f766e`, warm orange highlights `#f97316`); descriptive empty states, loading indicators, and toast notification alerts.

---

## 11. SYSTEM ARCHITECTURE

The application implements a decoupled, 3-Tier Client-Server Architecture:

```
+---------------------------------------------------------------+
|                    PRESENTATION LAYER                         |
|   React.js 18 + Tailwind CSS + Lucide Icons + Recharts        |
|   (Public Landing, Adoptable Catalog, Admin Workstation)      |
+------------------------------+--------------------------------+
                               |  HTTP / REST (JSON)
                               |  JWT Bearer Authorization
+------------------------------v--------------------------------+
|                     APPLICATION LAYER                         |
|   Node.js + Express.js REST API Server                        |
|   - Controllers: Auth, Pets, Medical, Vaccines, Adoptions...   |
|   - Middleware: Auth (JWT), CheckPermission, Multer, Logger   |
|   - Security: Bcrypt Password Hashing, Input Sanitization     |
+------------------------------+--------------------------------+
                               |  Connection Pool (mysql2)
                               |  Parameterized SQL Execution
+------------------------------v--------------------------------+
|                       DATABASE LAYER                          |
|   MySQL 8.0 Relational Database                               |
|   (19 Normalized InnoDB Tables, Foreign Keys, Indexes)        |
+---------------------------------------------------------------+
```

---

## 12. DATA FLOW DIAGRAMS (DFD)

### 12.1 DFD Level 0 (Context Level Diagram)

```
       +-----------------------+
       |   Adoption Applicant  |
       +-----------+-----------+
                   |
   Submit Online   |   Adoption Status &
   Application     |   Public Pet Catalog
                   v
       +---------------------------------------------+
       |                                             |
       |    0. PET ADOPTION & MANAGEMENT SYSTEM     |
       |                                             |
       +----------------------+----------------------+
                   ^          |
   Pet Records,    |          | Operational Stats,
   Vaccines, Visits|          | Alerts & Audit Logs
                   |          v
       +-----------+-----------+
       |  Admin / Staff User   |
       +-----------------------+
```

### 12.2 DFD Level 1 (Macro Process Flow)

```
Applicant / Staff
       |
       | (Credentials)
       v
+--------------+     Verify Hash     +-------------+
| 1.0 Auth &   |-------------------->| User Store  |
| Security     |<--------------------| (MySQL)     |
+-------+------+     Signed Token    +-------------+
        |
        +-----------------------------------+
        |                                   |
        v                                   v
+---------------+                   +---------------+
| 2.0 Pet       |                   | 3.0 Clinical  |
| Management    |                   | Management    |
+-------+-------+                   +-------+-------+
        | Read/Write                        | Read/Write
        v                                   v
+---------------+                   +---------------+
|  pets table   |                   | vaccinations  |
|  pet_photos   |                   | medical_recs  |
+-------+-------+                   +---------------+
        |                                   |
        +-----------------+-----------------+
                          |
                          v
                +-------------------+
                | 4.0 Adoption      |
                | Processing        |
                +---------+---------+
                          |
                          v
                +-------------------+
                | applications      |
                | visits & records  |
                +-------------------+
```

### 12.3 DFD Level 2 (Adoption & Visit Sub-system)

```
[Applicant] ---> (Submit Application) ---> [adoption_applications: PENDING]
                                                        |
                                                        v
[Staff Reviewer] <---------------------------- (Review Profile)
       |
       v
(Schedule Meet & Greet) ---> [visits: SCHEDULED]
                                    |
                                    v
(Conduct Inspection) ------> (Submit Visit Report: Positive/Neutral/Negative)
                                    |
                                    v
[visits: COMPLETED] -------> (Admin Final Decision)
                                    |
                    +---------------+---------------+
                    |                               |
              [APPROVED]                       [REJECTED]
                    |                               |
                    v                               v
    (Issue Certificate & Agreement)          (Log Rejection Reason)
    [adoption_records: Generated]            [pets: Revert Available]
    [pets: Status -> ADOPTED]
```

---

## 13. ENTITY-RELATIONSHIP (ER) DIAGRAM DESCRIPTION

The data model is centered around the core entity `pets`. The relationships are:
- **`users` to `user_permissions` (1 : N)** and **`permissions` to `user_permissions` (1 : N):** Models many-to-many role permissions.
- **`users` to `admins` (1 : 1):** Designates administrative root privilege.
- **`pets` to `pet_photos` (1 : N):** Supports multiple gallery photographs per animal.
- **`pets` to `medical_records` (1 : N):** Tracks clinical evaluations.
- **`medical_records` to `medical_documents` (1 : N):** Stores attached diagnostic PDFs.
- **`pets` to `vaccinations` (1 : N):** Stores immunizations and booster dates.
- **`pets` to `monthly_reports` (1 : N):** Tracks monthly progress reports.
- **`pets` to `adoption_applications` (1 : N):** Allows multiple applicants to express interest.
- **`adoption_applications` to `visits` (1 : N):** Coordinates home inspections.
- **`adoption_applications` to `adoption_records` (1 : 1):** Finalized legal adoption certificate.
- **`pets` to `foster_records` (1 : N):** Preserves foster placement history.
- **`rescue_records` to `pets` (1 : 1 optional):** Links field rescue incidents to created pet profiles.

---

## 14. DATABASE DESIGN & DATA DICTIONARY

The database comprises 19 normalized tables:

### Table 1: `users`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(150) | NOT NULL | User full name |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Login handle |
| `password_hash`| VARCHAR(255) | NOT NULL | Salted bcrypt hash |
| `email` | VARCHAR(150) | NULL | Contact email |
| `phone` | VARCHAR(50) | NULL | Mobile number |
| `role` | ENUM | NOT NULL | 'ADMIN', 'STAFF', 'USER' |
| `status` | ENUM | NOT NULL | 'ACTIVE', 'DISABLED' |
| `must_change_password`| BOOLEAN | DEFAULT FALSE | Forces initial credential update |
| `last_login_at`| DATETIME | NULL | Timestamp of last session |

### Table 2: `admins`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Administrator ID |
| `user_id` | INT | UNIQUE, FK `users(id)` | Linked user account |
| `is_root` | BOOLEAN | DEFAULT FALSE | Root admin flag (inviolable) |

### Table 3: `permissions`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Permission identifier |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | System code (e.g. `VIEW_PETS`) |
| `name` | VARCHAR(100) | NOT NULL | Display label |
| `module` | VARCHAR(100) | NOT NULL | Target subsystem |

### Table 4: `user_permissions`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Junction ID |
| `user_id` | INT | FK `users(id)` | Target user |
| `permission_id`| INT | FK `permissions(id)` | Assigned permission |

### Table 5: `pets`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Internal primary key |
| `pet_code` | VARCHAR(50) | UNIQUE, NOT NULL | Unique code: `PET-YYYY-XXXXX` |
| `name` | VARCHAR(100) | NOT NULL | Animal name |
| `animal_type` | ENUM | NOT NULL | Dog, Cat, Bird, Rabbit, etc. |
| `breed` | VARCHAR(100) | NOT NULL | Specific breed or mix |
| `dob` | DATE | NULL | Birth date |
| `age` | VARCHAR(50) | NULL | Formatted age string |
| `gender` | ENUM | NOT NULL | 'Male', 'Female', 'Unknown' |
| `color` | VARCHAR(50) | NOT NULL | Coat color |
| `weight` | DECIMAL(5,2) | NULL | Weight in kilograms |
| `identification_mark` | VARCHAR(255) | NULL | Unique physical distinguishing mark |
| `microchip_number` | VARCHAR(100) | NULL | 15-digit RFID chip code |
| `current_location` | VARCHAR(255) | NOT NULL | Enclosure, kennel, or foster home |
| `health_status` | ENUM | NOT NULL | Healthy, Under Treatment, etc. |
| `adoption_status` | ENUM | NOT NULL | Available, Adopted, Foster, etc. |
| `primary_photo_url` | VARCHAR(500) | NULL | Main display thumbnail |

### Table 6: `pet_photos`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Photo primary key |
| `pet_id` | INT | FK `pets(id)` | Parent pet record |
| `photo_url` | VARCHAR(500) | NOT NULL | File path or external URI |
| `is_primary`| BOOLEAN | DEFAULT FALSE | Main profile photo indicator |

### Table 7: `medical_records`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Clinical record ID |
| `pet_id` | INT | FK `pets(id)` | Associated pet |
| `record_date`| DATE | NOT NULL | Date of clinical visit |
| `vet_name` | VARCHAR(150) | NOT NULL | Attending surgeon name |
| `diagnosis` | VARCHAR(255) | NOT NULL | Clinical illness/condition |
| `treatment` | TEXT | NOT NULL | Surgical or physical therapy |
| `medicine` | TEXT | NULL | Prescribed pharmaceutical items |

### Table 8: `vaccinations`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Vaccine record ID |
| `pet_id` | INT | FK `pets(id)` | Vaccinated animal |
| `vaccine_name`| VARCHAR(150)| NOT NULL | Biological compound |
| `record_type`| ENUM | NOT NULL | Vaccine, Deworming, Check-up |
| `vaccine_date`| DATE | NOT NULL | Administered timestamp |
| `next_due_date`| DATE | NOT NULL | Deadline for booster |
| `status` | ENUM | NOT NULL | UPCOMING, DUE_SOON, OVERDUE |

### Table 9: `monthly_reports`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Report ID |
| `pet_id` | INT | FK `pets(id)` | Evaluated pet |
| `report_month`| VARCHAR(7) | NOT NULL | Month period (`YYYY-MM`) |
| `weight` | DECIMAL(5,2) | NOT NULL | Weight audit |
| `health_condition`| TEXT | NOT NULL | General vitality notes |
| `food` | TEXT | NOT NULL | Dietary intake |

### Table 10: `adoption_applications`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Application ID |
| `application_code`| VARCHAR(50)| UNIQUE, NOT NULL | Code: `APP-YYYY-XXXXX` |
| `pet_id` | INT | FK `pets(id)` | Requested pet |
| `applicant_name` | VARCHAR(150)| NOT NULL | Adopter name |
| `mobile_number` | VARCHAR(30) | NOT NULL | Contact telephone |
| `email` | VARCHAR(150)| NOT NULL | Contact email |
| `status` | ENUM | NOT NULL | PENDING, UNDER REVIEW, etc. |

### Table 11: `visits`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Visit ID |
| `application_id` | INT | FK `adoption_applications(id)` | Linked application |
| `visit_date` | DATE | NOT NULL | Scheduled appointment date |
| `visit_time` | TIME | NOT NULL | Scheduled appointment time |
| `visit_result` | ENUM | NOT NULL | Positive, Neutral, Negative, Pending |
| `recommendation`| TEXT | NULL | Staff inspector recommendation |

### Table 12: `adoption_records`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Legal adoption record ID |
| `application_id` | INT | UNIQUE, FK | Linked finalized application |
| `certificate_code`| VARCHAR(50)| UNIQUE, NOT NULL | Code: `CERT-YYYY-XXXXX` |
| `adoption_date` | DATE | NOT NULL | Legal transfer date |
| `agreement_text` | TEXT | NOT NULL | Binding guardianship terms |

### Table 13: `foster_records`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Foster placement ID |
| `pet_id` | INT | FK `pets(id)` | Fostered animal |
| `foster_person` | VARCHAR(150)| NOT NULL | Caregiver name |
| `start_date` | DATE | NOT NULL | Handover date |
| `expected_end_date`| DATE | NOT NULL | Planned return date |
| `status` | ENUM | NOT NULL | ACTIVE, RETURNED, ADOPTED |

### Table 14: `rescue_records`
| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Rescue incident ID |
| `rescue_code` | VARCHAR(50) | UNIQUE, NOT NULL | Code: `RES-YYYY-XXXXX` |
| `rescue_date` | DATE | NOT NULL | Field incident date |
| `rescue_location` | VARCHAR(255)| NOT NULL | Physical rescue landmark |
| `initial_condition`| TEXT | NOT NULL | Trauma/medical observations |
| `status` | ENUM | NOT NULL | RESCUED, CONVERTED_TO_PET |

### Tables 15–19: `notifications`, `activity_logs`, `settings`, `medical_documents`, `monthly_report_photos`
Manage audit trails, dashboard bells, organization profile configuration, and supplementary binary document uploads.

---

## 15. DETAILED MODULE SPECIFICATIONS

1. **Dashboard Analytics:** Calculates 10 KPIs on page load, aggregates species percentages, and plots monthly adoption velocity trends.
2. **Pet Profile & Photo Gallery:** Full CRUD with multi-image gallery support, primary photo setting, and tabbed inspection of all health and adoption records.
3. **Veterinary Medical Management:** Logs examinations chronologically with symptoms, diagnoses, treatment procedures, and prescription medicines.
4. **Vaccination & Preventive Alert Engine:** Analyzes current system date against scheduled dates and applies color-coded alerts (Green, Orange, Red).
5. **Monthly Progress Tracker:** Logs monthly weight, diet, and behavior evaluations without overwriting past entries.
6. **Multi-Stage Adoption Workflow:** Manages candidate screening, coordinates staff meet-and-greets, and finalizes adoptions with certificate issuance.
7. **Emergency Rescue Operations:** Captures field trauma details and enables 1-click generation of new adoptable pet profiles.
8. **User & Permission Administration:** Enforces granular access across all 13 modules and protects root administrator accounts.
9. **Reports & Exports:** Provides 9 printable analytical reports with instant CSV data streaming.

---

## 16. SECURITY & AUTHENTICATION ARCHITECTURE

- **Cryptographic Hashing:** Passwords hashed using bcrypt with salt rounds of 10.
- **JWT Authentication:** Stateless JWTs signed using HMAC-SHA256 (`HS256`) containing user ID, username, role, and permission array.
- **Strict Parameterized Queries:** All database interactions use parameter placeholders (`?`) to prevent SQL injection vulnerabilities.
- **Public Data Sanitization:** Public endpoints filter out internal staff notes, private medical documents, and applicant residential addresses.

---

## 17. SOFTWARE TESTING & QUALITY ASSURANCE

### 17.1 Test Strategy
Testing was executed across three phases:
- **Unit Testing:** Validating cryptographic token signing, password hashing, and ID generators (`generatePetCode`, `generateRescueCode`).
- **Integration Testing:** Verifying API routing, role-based authorization middleware, and database transaction consistency.
- **System Testing:** End-to-end user workflows from application submission to visit scheduling and adoption certificate issuance.

### 17.2 Formal Test Cases Table

| Test ID | Module | Test Scenario | Input Data | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Auth | Login with valid credentials | `admin` / `Admin@123` | HTTP 200, JWT token returned, redirect to Dashboard | **PASS** |
| **TC-02** | Auth | Login with incorrect password | `admin` / `WrongPass` | HTTP 401 Unauthorized, generic error message | **PASS** |
| **TC-03** | Auth | Demote/delete Root Admin | `DELETE /api/users/1` | HTTP 400 Bad Request, operation refused by security policy | **PASS** |
| **TC-04** | RBAC | Staff unauthorized action | User without `ADD_PET` calls `POST /api/pets` | HTTP 403 Forbidden, action blocked | **PASS** |
| **TC-05** | Pets | Pet ID auto-generation | Create Pet "Daisy" | Assigned unique code `PET-2026-00011` | **PASS** |
| **TC-06** | Vaccines| Overdue status calculation | Vaccine next due = 14 days ago | Calculated status = `OVERDUE`, badge = RED | **PASS** |
| **TC-07** | Vaccines| Due soon status calculation | Vaccine next due = 4 days from now | Calculated status = `DUE_SOON`, badge = ORANGE | **PASS** |
| **TC-08** | Monthly | Immutable progress reports | Submit report for pet 1, month `2026-07` | HTTP 400 duplicate rejected; historical report preserved | **PASS** |
| **TC-09** | Adoption| Adoption Approval Transition | Approve application APP-00003 | Pet status $\rightarrow$ `Adopted`, certificate code issued | **PASS** |
| **TC-10** | Rescue | Rescue to Pet Profile conversion | Convert RES-2026-00001 | Generates Pet record, links converted ID, sets status | **PASS** |

---

## 18. FUTURE SCOPE & ENHANCEMENTS

1. **Automated WhatsApp / SMS Reminders:** Integration with Twilio or Meta WhatsApp Business API for instant vaccination and visit alerts.
2. **Mobile GPS Geofencing for Foster Care:** Tracking foster pet wellness through mobile check-ins.
3. **AI-Powered Image Recognition:** Machine learning model to identify pet breed and estimate age from photographs during emergency intake.
4. **QR Code Verification on Certificates:** Publicly verifiable QR code on adoption certificates to validate legal guardianship.

---

## 19. CONCLUSION

The **Pet Adoption and Management System** successfully delivers an end-to-end, enterprise-ready full-stack software solution for animal rescue sanctuaries. By centralizing census tracking, automating vaccination deadline calculations, enforcing 13 modular role permissions, structuring adoption screening, and preserving medical history, the system eliminates the inefficiencies of manual record-keeping.

Built on React.js, Tailwind CSS, Express.js, and MySQL, the application meets all academic requirements for the BCA Final Year curriculum.

---

## 20. BCA VIVA-VOCE COMPREHENSIVE PREPARATION GUIDE (Q&A)

### Q1: What is the main objective of your BCA final year project?
**Answer:** The objective is to build a full-stack Pet Adoption and Management System that automates animal shelter administration, including census management, immunization tracking with dynamic urgency calculation, a 6-stage adoption screening pipeline, and role-based access control across 13 permissions.

### Q2: What technology stack did you select and why?
**Answer:**
- **Frontend:** React.js for component reusability and fast rendering via the Virtual DOM, styled with Tailwind CSS for modern responsive utility design.
- **Backend:** Node.js with Express.js for non-blocking asynchronous REST API request handling.
- **Database:** MySQL for structured relational data modeling, enforcing foreign key integrity and ACID transactions.
- **Authentication:** JSON Web Tokens (JWT) for stateless session verification and bcrypt for salted password hashing.

### Q3: Why is there no public user registration in this system?
**Answer:** Animal shelters require strict accountability to prevent fraudulent inquiries and unauthorized access. All user and staff accounts are provisioned and permissioned directly by the Administrator.

### Q4: How is Role-Based Access Control (RBAC) implemented?
**Answer:** RBAC is implemented at both the backend API and frontend UI levels:
1. **Backend:** A custom `checkPermission(code)` middleware inspects the user's JWT payload and permissions stored in the database. If the user lacks the permission code and is not an Admin, an HTTP 403 Forbidden response is returned.
2. **Frontend:** The Sidebar and action buttons check `hasPermission(code)`. Modules without permission are hidden, and direct URL access redirects to an Unauthorized error page.

### Q5: Can the primary Admin account be deleted?
**Answer:** No. The database table `admins` has an `is_root = 1` flag. In `userController.js`, attempts to delete or disable the Root Admin trigger a security violation exception and are rejected.

### Q6: How are vaccination alerts calculated?
**Answer:** Vaccination status is dynamically computed by comparing `next_due_date` against the current system date:
- If difference $< 0$ days $\rightarrow$ **OVERDUE (Red)**
- If difference $\le 7$ days $\rightarrow$ **DUE SOON (Orange)**
- If difference $> 7$ days $\rightarrow$ **UPCOMING (Green)**

### Q7: How does the Adoption Application workflow operate?
**Answer:** The adoption workflow progresses through six stages:
1. **PENDING:** Applicant submits the form.
2. **UNDER REVIEW:** Staff reviews background and housing conditions.
3. **VISIT SCHEDULED:** A shelter meet-and-greet or home inspection is arranged.
4. **VISIT COMPLETED:** Staff logs the interaction outcome (Positive/Neutral/Negative) and recommendation.
5. **APPROVED / REJECTED:** Administrator issues the final decision.
6. **ADOPTED:** Generates an official Adoption Certificate (`CERT-YYYY-XXXXX`) and marks the pet as Adopted.

### Q8: How is SQL injection prevented?
**Answer:** By using parameterized SQL queries with `?` placeholders across all controllers, ensuring user input is treated as literal data rather than executable SQL syntax.

### Q9: How are passwords secured in the database?
**Answer:** Passwords are never stored in plain text. They are hashed using bcrypt with 10 salt rounds before being stored in the `password_hash` column.

### Q10: What is the difference between DFD Level 0, Level 1, and Level 2?
**Answer:**
- **DFD Level 0 (Context):** Shows the entire system as a single process interacting with external entities (Applicants, Staff).
- **DFD Level 1:** Decomposes the system into major sub-processes (Auth, Pets, Medical, Adoption).
- **DFD Level 2:** Drills into specific complex processes (such as the multi-step Adoption and Visit scheduling pipeline).
