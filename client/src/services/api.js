import axios from 'axios';

const INTERNAL_API_BASE_URL = process.env.REACT_APP_INTERNAL_API_BASE_URL || 'http://localhost:4000/api';
const EXTERNAL_API_BASE_URL = INTERNAL_API_BASE_URL; // External API calls proxied through backend

// Axios instance for internal API
const internalApiClient = axios.create({
  baseURL: INTERNAL_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Axios instance for external API
const externalApiClient = axios.create({
  baseURL: EXTERNAL_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
internalApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`Internal API request: ${config.method.toUpperCase()} ${config.url}, token present: ${!!token}`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single response interceptor to handle 401/403
internalApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      const token = localStorage.getItem('token');

      if (!token || status === 401) {
        console.warn('Unauthorized access. Redirecting to login...');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// External API interceptors
externalApiClient.interceptors.request.use(
  (config) => {
    console.log(`External API request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

externalApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`External API error on ${error.config?.url}:`, error.message);
    return Promise.reject(error);
  }
);

// Services

export const masterDataService = {
  getDepartments: async () => {
    const response = await internalApiClient.get('/masterdata/departments');
    return response.data;
  },
  getLevels: async () => {
    const response = await internalApiClient.get('/masterdata/levels');
    return response.data;
  },
  getDesignations: async (departmentId) => {
    let url = '/masterdata/designations';
    if (departmentId) {
      url += `?department=${departmentId}`;
    }
    const response = await internalApiClient.get(url);
    return response.data;
  },
};

export const formService = {
  createForm: async (formData) => {
    const response = await internalApiClient.post('/forms', formData);
    return response.data;
  },
  publishForm: async (formId, publish) => {
    const response = await internalApiClient.patch(`/forms/${formId}/publish`, { isPublished: publish });
    return response.data;
  },
  getFormById: async (formId) => {
    const response = await internalApiClient.get(`/forms/${formId}`);
    return response.data;
  },
  updateForm: async (formId, updateData) => {
    const response = await internalApiClient.put(`/forms/${formId}`, updateData);
    return response.data;
  },
  getAllForms: async () => {
    const response = await internalApiClient.get('/forms');
    return response.data;
  },
  getAllResponses: async () => {
    const response = await internalApiClient.get('/responses');
    return response.data;
  },
  getResponseById: async (id) => {
    const response = await internalApiClient.get(`/responses/${id}`);
    return response.data;
  },
  deleteResponse: async (id) => {
    const response = await internalApiClient.delete(`/responses/${id}`);
    return response.data;
  },
  submitResponse: async (responseData) => {
    const response = await internalApiClient.post('/responses', responseData);
    return response.data;
  },
  getResponsesWithFilters: async (queryString) => {
    const response = await internalApiClient.get(`/responses?${queryString}`);
    return response.data;
  },
  deleteForm: async (formId) => {
    const response = await internalApiClient.delete(`/forms/${formId}`);
    return response.data;
  },
};

export const authService = {
  login: async (credentials) => {
    const response = await internalApiClient.post('/auth/login', credentials);
    return response.data;
  },
  logout: async () => {
    const response = await internalApiClient.post('/auth/logout');
    return response.data;
  },
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await internalApiClient.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  register: async (userData) => {
    const response = await internalApiClient.post('/auth/register', userData);
    return response.data;
  },
  verifyOtp: async (otpData) => {
    const response = await internalApiClient.post('/auth/verify-otp', otpData);
    return response.data;
  },
};

export const employeeService = {
  getEmployees: async () => {
    const token = localStorage.getItem('token');
    const response = await internalApiClient.get('/employee/employees', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  createEmployees: async (employees) => {
    const response = await internalApiClient.post('/employee/employees', employees);
    return response.data;
  },
  deleteEmployee: async (employeeId) => {
    const response = await internalApiClient.delete(`/employee/employees/${employeeId}`);
    return response.data;
  },
  getMyProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await internalApiClient.get('/employee/my-profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export const externalApiService = {
  getTotalUsers: async () => {
    const response = await externalApiClient.get('/external/totalusers');
    return response.data;
  },
};

export default internalApiClient;
