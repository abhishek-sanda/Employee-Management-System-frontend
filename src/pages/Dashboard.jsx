import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchEmployees } from '../services/employee.service';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STAT_CARD = ({ title, value, change }) => (
  <div className="bg-white p-4 rounded shadow flex flex-col">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-bold">{value}</div>
    {change !== undefined && (
      <div className="mt-1 text-xs text-gray-500">{change >= 0 ? `▲ ${change}` : `▼ ${Math.abs(change)}`}</div>
    )}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch a reasonably-sized page for dashboard stats.
  // Adjust limit if you have many employees or implement a /stats endpoint server-side.
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchEmployees({ page: 1, limit: 1000 }); // returning { success, data, meta }
        if (!mounted) return;
        setEmployees(res.data || []);
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || 'Failed to load employees';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'active').length;
    const inactive = employees.filter((e) => e.status === 'inactive').length;
    const terminated = employees.filter((e) => e.status === 'terminated').length;

    // recent hires within last 30 days
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const recentHires = employees
      .filter((e) => e.hireDate)
      .filter((e) => now - new Date(e.hireDate).getTime() <= THIRTY_DAYS)
      .sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate))
      .slice(0, 6);

    // department distribution
    const deptCounts = employees.reduce((acc, e) => {
      const d = e.department || 'Unassigned';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    // prepare department list sorted by count desc
    const departments = Object.entries(deptCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { total, active, inactive, terminated, recentHires, departments };
  }, [employees]);



  const canCreate = user && ['admin', 'hr', 'manager'].includes(user.role);
  const handleNew = () => navigate('/employees/new');



  // inside Dashboard component render, replace the "New Employee" button area with:


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-sm text-gray-500">Welcome back{user?.email ? `, ${user.email}` : ''}.</div>
        </div>

        <div className="flex items-center space-x-3">
          {canCreate && (
            <button onClick={handleNew} className="px-3 py-2 bg-green-600 text-white rounded shadow">
               New Employee
            </button>
            )}
          <Link to="/employees" className="px-3 py-2 bg-white border rounded shadow">
            View all
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          <div className="font-medium">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <STAT_CARD title="Total employees" value={loading ? '...' : stats.total} />
        <STAT_CARD title="Active" value={loading ? '...' : stats.active} />
        <STAT_CARD title="Inactive" value={loading ? '...' : stats.inactive} />
        <STAT_CARD title="Terminated" value={loading ? '...' : stats.terminated} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow col-span-2">
          <h2 className="text-lg font-semibold mb-3">Department distribution</h2>
          {loading ? (
            <div>Loading...</div>
          ) : stats.departments.length ? (
            <div className="space-y-3">
              {stats.departments.map((d) => {
                const pct = stats.total ? Math.round((d.count / stats.total) * 100) : 0;
                return (
                  <div key={d.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="text-gray-700">{d.name}</div>
                      <div className="text-gray-500">{d.count} ({pct}%)</div>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded">
                      <div className="bg-blue-600 h-3 rounded" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No department data</div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Recent hires (30 days)</h2>
          {loading ? (
            <div>Loading...</div>
          ) : stats.recentHires.length ? (
            <ul className="space-y-3">
              {stats.recentHires.map((h) => (
                <li key={h._id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{h.firstName} {h.lastName}</div>
                    <div className="text-xs text-gray-500">{h.position || '-'} • {h.department || '-'}</div>
                  </div>
                  <div className="text-sm text-gray-500">{h.hireDate ? new Date(h.hireDate).toLocaleDateString() : '-'}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No recent hires</div>
          )}

          <div className="mt-4">
            <Link to="/employees" className="text-sm text-blue-600">View all employees</Link>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleNew} className="px-3 py-2 bg-green-600 text-white rounded">Create employee</button>
          <Link to="/employees" className="px-3 py-2 bg-white border rounded">Manage employees</Link>
          {/* These actions assume backend endpoints exist; adjust behavior if not implemented */}
          <button
            onClick={() => alert('Import not implemented in this scaffold')}
            className="px-3 py-2 bg-yellow-500 text-white rounded"
          >
            Import CSV
          </button>
          <button
            onClick={() => alert('Export not implemented in this scaffold')}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Export CSV
          </button>
        </div>
      </div>
    </motion.div>
  );
}