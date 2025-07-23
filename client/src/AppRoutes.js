import React, { Suspense, lazy, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import FormBuilderNewWrapper from './pages/FormBuilderNewWrapper';
import FormView from './pages/FormView';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeRegistrationForm from './pages/EmployeeRegistrationForm';
import FillSurveys from './pages/FillSurveys';
import ViewResponses from './pages/ViewResponses';
import AddDepartment from './pages/AddDepartment';
import AddDesignation from './pages/AddDesignation';
import NotFound from './pages/NotFound';
import TotalEmployees from './pages/TotalEmployees';
import TotalForms from './pages/TotalForms';
import EditForm from './pages/EditForm';
import { UserContext } from './contexts/UserContext';

const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails'));

const AppRoutes = () => {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin-dashboard" replace />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee-registration" element={<EmployeeRegistrationForm />} />
      <Route path="/form-builder-new/:formId?" element={<FormBuilderNewWrapper />} />
      <Route path="/form/:formId" element={<FormView />} />
      <Route path="/fill-surveys" element={<FillSurveys />} />
      <Route path="/view-responses/:formId" element={<ViewResponses />} />
      <Route path="/employee-details" element={
        <Suspense fallback={<div>Loading...</div>}>
          <EmployeeDetails />
        </Suspense>
      } />
      <Route path="/add-department" element={<AddDepartment />} />
      <Route path="/add-designation/:deptId" element={<AddDesignation />} />
      <Route path="/total-employees" element={<TotalEmployees />} />
      <Route path="/total-forms" element={<TotalForms />} />
      {/* Fixed route with authentication check for /edit/:formId */}
      <Route path="/edit/:formId" element={
        isAuthenticated ? <EditForm /> : <Navigate to="/login" replace />
      } />
      <Route path="/edit-form/:formId" element={<EditForm />} />


      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
