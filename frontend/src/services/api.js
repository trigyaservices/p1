/**
 * API Client Service
 * Centralized fetch wrapper for all REST API endpoints
 */

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // If file download (like CSV export)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      const blob = await response.blob();
      return blob;
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        // Clear expired session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=1';
      }
      throw new Error(data.message || 'Server request failed');
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => request('/auth/me'),
  changePassword: (data) => request('/auth/change-password', { method: 'PUT', body: data }),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: data }),

  // Public Pets
  getPublicCatalog: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/pets/public/catalog?${query}`);
  },
  getPublicPet: (id) => request(`/pets/public/${id}`),

  // Public Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: data }),

  // Public/User Adoption apply
  applyForAdoption: (data) => request('/adoptions/apply', { method: 'POST', body: data }),
  getMyApplications: () => request('/adoptions/my'),

  // Pets Management
  getPets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/pets?${query}`);
  },
  getPetById: (id) => request(`/pets/${id}`),
  createPet: (data) => request('/pets', { method: 'POST', body: data }),
  updatePet: (id, data) => request(`/pets/${id}`, { method: 'PUT', body: data }),
  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' }),

  // Pet Photos
  uploadPetPhoto: (id, formData) => request(`/pets/${id}/photos`, { method: 'POST', body: formData }),
  setPrimaryPhoto: (petId, photoId) => request(`/pets/${petId}/photos/${photoId}/primary`, { method: 'PUT' }),
  deletePetPhoto: (petId, photoId) => request(`/pets/${petId}/photos/${photoId}`, { method: 'DELETE' }),

  // Medical Management
  getMedicalRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/medical?${query}`);
  },
  getMedicalRecordById: (id) => request(`/medical/${id}`),
  createMedicalRecord: (data) => request('/medical', { method: 'POST', body: data }),
  updateMedicalRecord: (id, data) => request(`/medical/${id}`, { method: 'PUT', body: data }),
  deleteMedicalRecord: (id) => request(`/medical/${id}`, { method: 'DELETE' }),

  // Vaccinations & Health Reminders
  getVaccinations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/vaccinations?${query}`);
  },
  getVaccinationAlerts: () => request('/vaccinations/alerts'),
  createVaccination: (data) => request('/vaccinations', { method: 'POST', body: data }),
  updateVaccination: (id, data) => request(`/vaccinations/${id}`, { method: 'PUT', body: data }),
  deleteVaccination: (id) => request(`/vaccinations/${id}`, { method: 'DELETE' }),

  // Monthly Reports
  getMonthlyReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/monthly-reports?${query}`);
  },
  getPetMonthlyTimeline: (petId) => request(`/monthly-reports/${petId}/timeline`),
  createMonthlyReport: (data) => request('/monthly-reports', { method: 'POST', body: data }),
  updateMonthlyReport: (id, data) => request(`/monthly-reports/${id}`, { method: 'PUT', body: data }),
  deleteMonthlyReport: (id) => request(`/monthly-reports/${id}`, { method: 'DELETE' }),

  // Adoption Workflow & Applications
  getAdoptionApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/adoptions?${query}`);
  },
  getApplicationById: (id) => request(`/adoptions/${id}`),
  updateApplicationStatus: (id, data) => request(`/adoptions/${id}/status`, { method: 'PUT', body: data }),
  approveAdoption: (id, data) => request(`/adoptions/${id}/approve`, { method: 'POST', body: data }),
  rejectAdoption: (id, data) => request(`/adoptions/${id}/reject`, { method: 'POST', body: data }),
  getAdoptionCertificate: (id) => request(`/adoptions/${id}/certificate`),

  // Visits
  getVisits: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/visits?${query}`);
  },
  scheduleVisit: (data) => request('/visits', { method: 'POST', body: data }),
  updateVisit: (id, data) => request(`/visits/${id}`, { method: 'PUT', body: data }),
  recordVisitReport: (id, data) => request(`/visits/${id}/report`, { method: 'POST', body: data }),

  // Foster Care
  getFosterRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/foster?${query}`);
  },
  createFosterPlacement: (data) => request('/foster', { method: 'POST', body: data }),
  returnFromFoster: (id, data) => request(`/foster/${id}/return`, { method: 'PUT', body: data }),

  // Rescue Management
  getRescues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/rescue?${query}`);
  },
  createRescue: (data) => request('/rescue', { method: 'POST', body: data }),
  convertToPet: (id, data) => request(`/rescue/${id}/convert-to-pet`, { method: 'POST', body: data }),

  // Users & Permissions Management
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users?${query}`);
  },
  getPermissionsList: () => request('/users/permissions'),
  createUser: (data) => request('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
  toggleUserStatus: (id, status) => request(`/users/${id}/status`, { method: 'PUT', body: { status } }),
  resetUserPassword: (id, newPassword) => request(`/users/${id}/reset-password`, { method: 'POST', body: { newPassword } }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Dashboard & Analytics
  getDashboardStats: () => request('/dashboard/stats'),
  getDashboardCharts: () => request('/dashboard/charts'),
  getRecentActivity: () => request('/dashboard/recent-activity'),

  // Reports
  getReportData: (type, format = '') => request(`/reports/${type}${format ? `?format=${format}` : ''}`),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Activity Logs
  getActivityLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/activity-logs?${query}`);
  }
};
