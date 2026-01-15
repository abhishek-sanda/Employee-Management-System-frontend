import api from './api';

export async function fetchEmployees({ page = 1, limit = 20, q = '', signal } = {}) {
  // include a timestamp to avoid cached 304 responses when you want fresh data
  const params = { page, limit, q, _ts: Date.now() };
  const res = await api.get('/api/employees', {
    params,
    signal
  });

  return res.data;
}


export async function createEmployee(payload) {
  const res = await api.post('/api/employees', payload);
  return res.data;
}

export async function updateEmployee(id, payload) {
  const res = await api.put(`/api/employees/${id}`, payload);
  return res.data;
}

export async function getEmployee(id) {
  const res = await api.get(`/api/employees/${id}`);
  return res.data;
}

export async function deleteEmployee(id) {
  const res = await api.delete(`/api/employees/${id}`);
  return res.data;
}