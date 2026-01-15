import React, { useEffect, useState, useRef } from 'react';
import { fetchEmployees } from '../../services/employee.service';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function EmployeesList() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const searchTimeout = useRef(null);
  const currentController = useRef(null);

  const canCreate = user && ['admin', 'hr', 'manager'].includes(user.role);

  const load = async ({ page = 1, limit = 20, query = q } = {}) => {
    setLoading(true);
    setError(null);

    if (currentController.current) {
      currentController.current.abort();
    }
    const controller = new AbortController();
    currentController.current = controller;

    try {
      const res = await fetchEmployees({ page, limit, q: query, signal: controller.signal });
      if (res && res.data) {
        setItems(res.data);
        setMeta(res.meta || {});
      } else {
        setItems([]);
        setMeta({});
      }
    } catch (err) {
      const isCanceled =
        err?.name === 'CanceledError' ||
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED';

      if (isCanceled) {
        return;
      }

      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message || JSON.stringify(err.response.data) || err.message;
        setError(`Server ${status}: ${msg}`);

        if (status === 401) {
          try { await logout(); } catch (e) {}
          navigate('/login', { replace: true });
        }
      } else if (err.request) {
        setError(
          'No response from server. This may be a CORS issue or the backend is not reachable. Check DevTools → Network for the OPTIONS/GET details.'
        );
      } else {
        setError(`Request error: ${err.message}`);
      }

      setItems([]);
      setMeta({});
      console.error('Employees load error:', err);
    } finally {
      setLoading(false);
      currentController.current = null;
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (currentController.current) currentController.current.abort();
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const onSearchChange = (val) => {
    setQ(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      load({ page: 1, query: val });
    }, 400);
  };

  const renderManager = (mgr) => {
    if (!mgr) return '-';
    if (typeof mgr === 'string') return mgr;
    return `${mgr.firstName || ''} ${mgr.lastName || ''}`.trim() || mgr.employeeId || '-';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Employees</h2>
        <div className="space-x-2">
          {canCreate && <Link to="/employees/new" className="bg-green-600 text-white px-3 py-1 rounded">New</Link>}
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-2">
        <input
          className="border rounded px-3 py-2 w-full md:w-1/3 mb-2 md:mb-0"
          placeholder="Search by name, email or id"
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => load({ page: 1, query: q })}>
          Search
        </button>
        <button
          className="ml-2 px-3 py-2 bg-gray-200 rounded"
          onClick={() => {
            setQ('');
            load({ page: 1, query: '' });
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          <div className="font-medium mb-1">Error loading employees</div>
          <div className="text-sm">{error}</div>
          <div className="mt-2 text-xs text-gray-500">
            Tip: Open DevTools → Network and inspect the OPTIONS and GET requests for /api/employees.
          </div>
          <div className="mt-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => load()}>
              Retry
            </button>
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="bg-white rounded shadow overflow-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-4">Loading...</td></tr>
              ) : items.length ? (
                items.map((it) => (
                  <tr key={it._id} className="border-t">
                    <td className="px-4 py-3">{it.employeeId}</td>
                    <td className="px-4 py-3">{it.firstName} {it.lastName}</td>
                    <td className="px-4 py-3">{it.email}</td>
                    <td className="px-4 py-3">{it.department || '-'}</td>
                    <td className="px-4 py-3">{renderManager(it.managerId)}</td>
                    <td className="px-4 py-3">{it.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-4">No employees</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}