# 🐾 PET ADOPTION AND MANAGEMENT SYSTEM
### Bachelor of Computer Applications (BCA) - Final Year Project

A real full-stack web application designed for animal shelters, rescue sanctuaries, and veterinary clinics. Built with **React.js**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MySQL**.

---

## 📌 Technology Stack

- **Frontend:** React.js (v18), Vite, Tailwind CSS, Lucide React Icons, Recharts Analytics
- **Backend:** Node.js (v18+), Express.js REST API
- **Database:** MySQL 8.0+ / MariaDB (Normalized 19-table schema with foreign keys and indexes)
- **Security:** JWT (JSON Web Tokens) stateless authentication + salted bcrypt password hashing
- **File Uploads:** Multer with mime-type filtering and storage management
- **Execution:** Runs locally with `npm run dev` in both `frontend` and `backend`

---

## 🚀 Quick Start & Local Setup Instructions

### Prerequisites
- Node.js (v18.x or v20.x LTS) & npm installed
- MySQL Server 8.0+ or MariaDB (via standalone MySQL, XAMPP, or Docker)

---

### Step 1: Database Setup (MySQL)

1. Open your terminal or MySQL command-line client:
   ```bash
   mysql -u root -p
   ```
2. Create and import the normalized schema and demo seed dataset:
   ```sql
   SOURCE database/schema.sql;
   SOURCE database/seed.sql;
   ```
   *(Alternatively, copy and execute the contents of `database/schema.sql` followed by `database/seed.sql` into MySQL Workbench or phpMyAdmin).*

---

### Step 2: Backend Setup & Launch

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Review or update environment variables in `.env`:
   ```ini
   PORT=5000
   NODE_ENV=development

   # Database Settings
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=pet_adoption_system

   # JWT Security Key
   JWT_SECRET=super_secret_jwt_key_for_pet_adoption_bca_project_2026
   JWT_EXPIRES_IN=7d
   ```
3. Install dependencies and start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend REST API will start at **http://localhost:5000**.*

---

### Step 3: Frontend Setup & Launch

1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 👥 User Roles & Demo Credentials

*Note: For security, public self-registration is disabled. All personnel and applicant accounts are created by the Administrator.*

| Role | Username | Password | Purpose & Granted Permissions |
| :--- | :--- | :--- | :--- |
| **Root Admin** | `admin` | `Admin@123` | **Full System Control** (All 13 modules, protected root account) |
| **Veterinarian** | `dr.sharma` | `Staff@123` | **Medical & Vaccines** (View Pets, Medical, Vaccines, Monthly Reports) |
| **Shelter Manager** | `priya.patel` | `Staff@123` | **Adoptions & Operations** (Pets, Photos, Adoptions, Visits, Reports) |
| **Rescue Officer** | `vikram.rescue` | `Staff@123` | **Field Rescue** (View Pets, Add Pet, Photos, Rescue Intake) |
| **Applicant / User**| `anita.adopter` | `User@123` | **Adoption Portal** (View Pets, Apply for Adoption, Track Application) |

---

## 📂 Project Architecture

```
pet-adoption-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection (MySQL pool & safe fallback)
│   │   ├── controllers/     # Business logic for all 15 modules
│   │   ├── middleware/      # Auth (JWT), CheckPermission (RBAC), Upload (Multer)
│   │   ├── routes/          # Express route definitions
│   │   ├── utils/           # Bcrypt hashing, token signing, ID generators
│   │   └── server.js        # Main Express application entrypoint
│   ├── uploads/             # Static storage for pet photos, medical PDFs
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, StatCard, StatusBadge, Modal, Table
│   │   ├── context/         # AuthContext (RBAC) & ToastContext
│   │   ├── pages/           # Public & Administrative page views
│   │   ├── services/        # Centralized REST API client
│   │   ├── App.jsx          # Route manager & permission guard
│   │   ├── main.jsx         # React DOM mount point
│   │   └── index.css        # Tailwind styling & print directives
│   ├── index.html
│   ├── dev-server.cjs       # Development server with automatic proxying
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql           # Complete MySQL DDL (19 normalized tables)
│   └── seed.sql             # 10 pets, 5 users, medical logs, vaccinations, visits
├── docs/
│   └── BCA_PROJECT_REPORT.md# Complete academic report, SRS, DFD, ER, Viva Q&A
└── README.md
```

---

## 🌟 Key Application Features

1. **Auto Pet ID Generation:** Every animal registered receives a formatted ID like `PET-2026-00001`.
2. **Preventive Vaccination Urgency Engine:**
   - 🟢 **Green (Upcoming):** Scheduled in > 7 days.
   - 🟠 **Orange (Due Soon):** Scheduled in &le; 7 days.
   - 🔴 **Red (Overdue):** Past due date, triggering urgent dashboard alerts.
3. **Structured 6-Stage Adoption Pipeline:**
   `PENDING` $\rightarrow$ `UNDER REVIEW` $\rightarrow$ `VISIT SCHEDULED` $\rightarrow$ `VISIT COMPLETED` $\rightarrow$ `APPROVED/REJECTED` $\rightarrow$ `ADOPTED`
4. **Adoption Certificate Issuance:** Automatically generates an official adoption certificate with reference code `CERT-YYYY-XXXXX`.
5. **Emergency Rescue Management:** Logs field rescues and allows 1-click transformation into formal adoptable profiles.
6. **Granular 13-Module Permission Matrix:** Restricts access across View Pets, Add Pet, Edit Pet, Delete Pet, Upload Photos, Medical, Vaccination, Monthly Reports, Adoption, Visits, Reports, User Management, and Settings.
7. **9 Exportable System Reports:** Instant on-screen tables with 1-click CSV streaming and printable layouts.
8. **Root Admin Protection:** The primary administrator cannot be deleted or disabled.

---

## 📡 REST API Reference Summary

### Authentication & Personnel
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve active user session profile and permissions
- `PUT /api/auth/change-password` — Update user account password
- `GET /api/users` — List personnel directory with roles and permissions
- `POST /api/users` — Create new staff account with granular permissions
- `PUT /api/users/:id/status` — Enable or disable user account
- `POST /api/users/:id/reset-password` — Administrative password reset

### Pet Management
- `GET /api/pets/public/catalog` — Publicly viewable catalog of adoptable pets
- `GET /api/pets/public/:id` — Public sanitized pet profile
- `GET /api/pets` — Staff list of all animals with filters & pagination
- `POST /api/pets` — Register new pet (`PET-YYYY-XXXXX`)
- `PUT /api/pets/:id` — Modify pet information
- `DELETE /api/pets/:id` — Archive or delete pet record
- `POST /api/pets/:id/photos` — Upload gallery photograph
- `PUT /api/pets/:id/photos/:photoId/primary` — Assign primary photo

### Healthcare & Reports
- `GET /api/medical` — Chronological clinical medical logbook
- `POST /api/medical` — File diagnosis, treatment, and prescription
- `GET /api/vaccinations` — Immunization schedule with computed urgency
- `GET /api/vaccinations/alerts` — Summary of due-soon and overdue vaccines
- `POST /api/vaccinations` — Schedule vaccine or health reminder
- `GET /api/monthly-reports` — Longitudinal progress records
- `POST /api/monthly-reports` — File monthly weight and dietary review

### Adoption & Visits
- `POST /api/adoptions/apply` — Submit digital adoption application
- `GET /api/adoptions` — Review adoption pipeline applications
- `PUT /api/adoptions/:id/status` — Advance application through workflow
- `POST /api/adoptions/:id/approve` — Approve adoption and issue certificate
- `GET /api/adoptions/:id/certificate` — Fetch adoption certificate details
- `GET /api/visits` — Retrieve scheduled meet-and-greets
- `POST /api/visits` — Schedule applicant visit and assign staff
- `POST /api/visits/:id/report` — Record visit evaluation outcome

### Analytics & System
- `GET /api/dashboard/stats` — 10 shelter KPIs
- `GET /api/dashboard/charts` — Species breakdown and adoption velocity
- `GET /api/reports/:type` — Generate 9 official reports (supports `?format=csv`)
- `GET /api/activity-logs` — Audit trail of operations
- `GET /api/settings` — Shelter profile, emergency numbers, and branding

---

## 🧪 Testing and Verification

To verify that both frontend and backend are functional locally:
```bash
# Verify backend API health check
curl http://localhost:5000/api/health

# Verify adoptable pets catalog
curl http://localhost:5000/api/pets/public/catalog

# Verify frontend response
curl http://localhost:5173
```

---

## 📖 Academic Documentation

For complete university submission requirements, refer to:
- [`docs/BCA_PROJECT_REPORT.md`](docs/BCA_PROJECT_REPORT.md) — Comprehensive System Requirements Specification (SRS), DFD Levels 0, 1, 2, ER Diagram specifications, Data Dictionary for all 19 tables, formal Test Cases table, and a 20+ Viva-Voce Q&A guide.

---

**Developed for BCA Final Year Project Submission (2025–2026)**
