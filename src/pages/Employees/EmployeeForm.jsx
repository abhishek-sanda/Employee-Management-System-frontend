import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, getEmployee, updateEmployee } from '../../services/employee.service';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // if present -> edit mode
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const canEditSensitive = user && ['admin', 'hr'].includes(user.role);

  const [form, setForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    managerId: '',
    hireDate: '',
    salary: '',
    ssn: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    status: 'active',
    photoUrl: '',
    metadata: {}
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEmployee(id);
        const emp = res.data;
        if (!mounted) return;
        setForm({
          employeeId: emp.employeeId || '',
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          phone: emp.phone || '',
          position: emp.position || '',
          department: emp.department || '',
          managerId: emp.managerId && typeof emp.managerId === 'object' ? (emp.managerId._id || '') : (emp.managerId || ''),
          hireDate: emp.hireDate ? new Date(emp.hireDate).toISOString().slice(0, 10) : '',
          salary: emp.salary === undefined ? '' : emp.salary,
          ssn: emp.ssn === undefined ? '' : emp.ssn,
          address: {
            line1: emp.address?.line1 || '',
            line2: emp.address?.line2 || '',
            city: emp.address?.city || '',
            state: emp.address?.state || '',
            zip: emp.address?.zip || '',
            country: emp.address?.country || ''
          },
          status: emp.status || 'active',
          photoUrl: emp.photoUrl || '',
          metadata: emp.metadata || {}
        });
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setForm((s) => ({ ...s, address: { ...s.address, [key]: value } }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const validate = () => {
    if (!form.employeeId) return 'Employee ID is required';
    if (!form.firstName) return 'First name required';
    if (!form.lastName) return 'Last name required';
    if (!form.email) return 'Email required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSaving(true);
    try {
      const payloadBase = {
        employeeId: form.employeeId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        position: form.position || undefined,
        department: form.department || undefined,
        managerId: form.managerId || undefined,
        hireDate: form.hireDate || undefined,
        address: form.address,
        status: form.status,
        photoUrl: form.photoUrl || undefined,
        metadata: form.metadata
      };

      // Only include sensitive fields if allowed
      if (canEditSensitive) {
        if (form.salary !== '') payloadBase.salary = Number(form.salary);
        if (form.ssn !== '') payloadBase.ssn = form.ssn;
      }

      if (isEdit) {
        await updateEmployee(id, payloadBase);
      } else {
        await createEmployee(payloadBase);
      }
      navigate('/employees', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || (err?.response?.data?.error && err.response.data.error.join?.(', ')) || err.message || 'Failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading employee...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Edit Employee' : 'Create Employee'}</h2>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Employee ID</label>
              <input name="employeeId" value={form.employeeId} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm">First name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">Last name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">Position</label>
              <input name="position" value={form.position} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Manager (id)</label>
              <input name="managerId" value={form.managerId} onChange={handleChange} className="w-full border rounded px-2 py-1" placeholder="ObjectId of manager" />
            </div>

            <div>
              <label className="block text-sm">Hire date</label>
              <input name="hireDate" value={form.hireDate} onChange={handleChange} type="date" className="w-full border rounded px-2 py-1" />
            </div>

            {canEditSensitive && (
              <>
                <div>
                  <label className="block text-sm">Salary</label>
                  <input name="salary" value={form.salary} onChange={handleChange} type="number" className="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-sm">SSN</label>
                  <input name="ssn" value={form.ssn} onChange={handleChange} className="w-full border rounded px-2 py-1" />
                </div>
              </>
            )}

            {!canEditSensitive && isEdit && (
              <>
                <div>
                  <label className="block text-sm">Salary</label>
                  <div className="w-full border rounded px-2 py-1 bg-gray-50">{form.salary === '' ? '-' : form.salary}</div>
                </div>
                <div>
                  <label className="block text-sm">SSN</label>
                  <div className="w-full border rounded px-2 py-1 bg-gray-50">{form.ssn === '' ? '-' : form.ssn}</div>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm">Address Line 1</label>
            <input name="address.line1" value={form.address.line1} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm">Address Line 2</label>
            <input name="address.line2" value={form.address.line2} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm">City</label>
              <input name="address.city" value={form.address.city} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">State</label>
              <input name="address.state" value={form.address.state} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm">ZIP</label>
              <input name="address.zip" value={form.address.zip} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>
              {saving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save' : 'Create')}
            </button>
            <button type="button" onClick={() => navigate('/employees')} className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}