import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionAPI = {
  transfer: (data) => api.post('/transactions/transfer', data),
  getMyTransactions: () => api.get('/transactions'),
  getAllTransactions: () => api.get('/transactions/all'),
}

// ── Attack Simulator ──────────────────────────────────────────────────────────
export const simulatorAPI = {
  capture: (data) => api.post('/attack-simulator/capture', data),
  replay: () => api.post('/attack-simulator/replay'),
  replayAdaptive: () => api.post('/attack-simulator/replay-adaptive'),
  getSimulations: () => api.get('/attack-simulator/simulations'),
}

// ── Security ──────────────────────────────────────────────────────────────────
export const securityAPI = {
  getEvents: () => api.get('/security/events'),
  getRecentEvents: (mins = 60) => api.get(`/security/events/recent?minutes=${mins}`),
  getIncidents: () => api.get('/security/incidents'),
  getDashboard: () => api.get('/security/dashboard'),
  getMetrics: () => api.get('/security/metrics'),
  getHealth: () => api.get('/health'),
}

// ── ML Service (direct, via backend proxy) ────────────────────────────────────
export const mlAPI = {
  getMetrics: () => axios.get('http://localhost:8000/metrics'),
  getFeatures: () => axios.get('http://localhost:8000/features'),
  getHealth: () => axios.get('http://localhost:8000/health'),
}

export default api
