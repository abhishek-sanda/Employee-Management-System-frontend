import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getEmployee } from '../../services/employee.service';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canEdit = user && ['admin', 'hr', 'manager'].includes(user.role);
  const canSeeSensitive = user && ['admin', 'hr'].includes(user.role);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEmployee(id);
        // res is { success, data }
        if (mounted) setEmployee(res.data);
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || 'Failed to load';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  if (!employee) {
    return <div className="p-6">No employee found.</div>;
  }

  const managerName = employee.managerId && typeof employee.managerId === 'object'
    ? `${employee.managerId.firstName || ''} ${employee.managerId.lastName || ''}`.trim() || employee.managerId.employeeId
    : (employee.managerId || '-');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h1>
            <div className="text-sm text-gray-500">{employee.position || '-'} — {employee.department || '-'}</div>
            <div className="mt-2 text-xs text-gray-500">ID: {employee.employeeId}</div>
          </div>

          <div className="space-x-2">
            <Link to="/employees" className="px-3 py-1 bg-gray-200 rounded">Back</Link>
            {canEdit && (
              <button
                onClick={() => navigate(`/employees/${employee._id}/edit`)}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium">{employee.email}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Phone</div>
            <div className="font-medium">{employee.phone || '-'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Manager</div>
            <div className="font-medium">{managerName}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Hire Date</div>
            <div className="font-medium">{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '-'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="font-medium">{employee.status}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Photo</div>
            <div className="font-medium">
              {employee.photoUrl ? (
                <img src={employee.photoUrl} alt="photo" className="w-20 h-20 object-cover rounded" />
              ) : (
                '-'
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-gray-500">Address</div>
            <div className="font-medium">
              {employee.address ? (
                <>
                  {employee.address.line1 && <div>{employee.address.line1}</div>}
                  {employee.address.line2 && <div>{employee.address.line2}</div>}
                  <div>{[employee.address.city, employee.address.state, employee.address.zip].filter(Boolean).join(', ')}</div>
                  {employee.address.country && <div>{employee.address.country}</div>}
                </>
              ) : (
                '-'
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Salary</div>
            <div className="font-medium">{employee.salary !== undefined ? employee.salary : '-'}</div>
            {!canSeeSensitive && <div className="text-xs text-gray-500">(masked to you)</div>}
          </div>

          <div>
            <div className="text-sm text-gray-500">SSN</div>
            <div className="font-medium">{employee.ssn !== undefined ? employee.ssn : '-'}</div>
            {!canSeeSensitive && <div className="text-xs text-gray-500">(masked to you)</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}