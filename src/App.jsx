import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmployeesList from './pages/Employees/EmployeesList';
import EmployeeForm from './pages/Employees/EmployeeForm';
import EmployeeDetails from './pages/Employees/EmployeeDetails';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <PrivateRoute>
            <Layout>
              <EmployeesList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <PrivateRoute>
            <Layout>
              <EmployeeForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <PrivateRoute>
            <Layout>
              <EmployeeDetails />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <PrivateRoute>
            <Layout>
              <EmployeeForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}