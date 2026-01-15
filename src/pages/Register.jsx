import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const roles = ['admin', 'hr', 'manager', 'employee'];

  function validate() {
    setError(null);
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      return 'Please provide a valid email address.';
    }
    if (!form.password || form.password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    if (!roles.includes(form.role)) {
      return 'Invalid role selected.';
    }
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/register', {
        email: form.email,
        password: form.password,
        role: form.role
      });
      setSuccessMsg('Registration successful. Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1400);
    } catch (err) {
      const msg = err?.response?.data?.message || (err?.response?.data?.error && err.response.data.error.join?.(', ')) || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white p-8 rounded shadow"
      >
        <h2 className="text-2xl font-semibold mb-4">Create an account</h2>

        {error && <div className="mb-3 text-red-600">{error}</div>}
        {successMsg && <div className="mb-3 text-green-600">{successMsg}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              className="w-full border rounded px-3 py-2"
              value={form.password}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              className="w-full border rounded px-3 py-2"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose a role for the new user.</p>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </motion.div>
    </div>
  );
}