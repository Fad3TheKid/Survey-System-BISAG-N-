import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, CircularProgress, GlobalStyles } from '@mui/material';
import EmployeeRegistrationForm from './pages/EmployeeRegistrationForm';
import Nav from './Nav';
import FillSurveys from './pages/FillSurveys';
import ViewResponses from './pages/ViewResponses';
import { UserProvider } from './contexts/UserContext';
import AddDepartment from './pages/AddDepartment';
import AddDesignation from './pages/AddDesignation';
import Homepage from './pages/Homepage';
import TotalEmployees from './pages/TotalEmployees';
import TotalForms from './pages/TotalForms';

// Lazy load pages
const FormBuilder = lazy(() => import('./pages/FormBuilder'));
const FormView = lazy(() => import('./pages/FormView'));
const FormResponse = lazy(() => import('./pages/FormResponse'));
const ResponseView = lazy(() => import('./pages/ResponseView'));
const Login = lazy(() => import('./pages/Login'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminEmployeeDetails = lazy(() => import('./pages/AdminEmployeeDetails'));
const Register = lazy(() => import('./pages/Register'));
const OtpVerification = lazy(() => import('./pages/OtpVerification'));
const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails'));
const EditForm = lazy(() => import('./pages/EditForm'));


function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );
}

function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </Box>
  );
}

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
  const userRole = localStorage.getItem('userRole') || 'employee';

  return (
    <>
      <GlobalStyles
        styles={{
          body: { margin: 0, padding: 0, width: '100vw', backgroundColor: '#add8e6' },
          html: { margin: 0, padding: 0, width: '100vw', backgroundColor: '#add8e6' },
          '#root': { width: '100vw', margin: 0, padding: 0 },
        }}
      />
      <UserProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', m: 0, p: 0 }}>
          <Nav />
          <Container
            component="main"
            maxWidth={false}
            sx={{
              flex: 1,
              p: isAuthPage ? 0 : 4,
              m: 0,
              width: '100vw',
              maxWidth: '100vw',
              minHeight: '100vh',
            }}
          >
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    isAuthenticated ? (
                      userRole === 'admin' ? (
                        <Navigate to="/admin-dashboard" replace />
                      ) : (
                        <Navigate to="/employee-dashboard" replace />
                      )
                    ) : (
                      <Navigate to="/homepage" replace />
                    )
                  }
                />
                <Route path="/create" element={isAuthenticated ? <FormBuilder /> : <Navigate to="/login" replace />} />
                <Route path="/edit-form/:formId" element={isAuthenticated ? <EditForm /> : <Navigate to="/login" replace />} />
                <Route path="/form/:formId" element={isAuthenticated ? <FormView /> : <Navigate to="/login" replace />} />
                <Route path="/response/:formId" element={isAuthenticated ? <FormResponse /> : <Navigate to="/login" replace />} />
                <Route path="/responses/:formId" element={isAuthenticated ? <ResponseView /> : <Navigate to="/login" replace />} />
                <Route path="/employee-dashboard" element={isAuthenticated ? <EmployeeDashboard /> : <Navigate to="/login" replace />} />
                <Route path="/employee-registration" element={isAuthenticated ? <EmployeeRegistrationForm /> : <Navigate to="/login" replace />} />
                <Route path="/admin-dashboard" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" replace />} />
                <Route path="/admin-employee-details" element={isAuthenticated ? <AdminEmployeeDetails /> : <Navigate to="/login" replace />} />
                <Route path="/fill-surveys" element={isAuthenticated ? <FillSurveys /> : <Navigate to="/login" replace />} />
                <Route path="/view-responses" element={isAuthenticated ? <ViewResponses /> : <Navigate to="/login" replace />} />
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
                <Route path="/otp-verification" element={!isAuthenticated ? <OtpVerification /> : <Navigate to="/" replace />} />
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/employee-details" element={isAuthenticated ? <EmployeeDetails /> : <Navigate to="/login" replace />} />
                <Route path="/add-department" element={isAuthenticated ? <AddDepartment /> : <Navigate to="/login" replace />} />
                <Route path="/add-designation/:deptId" element={isAuthenticated ? <AddDesignation /> : <Navigate to="/login" replace />} />
                <Route path="/total-employees" element={isAuthenticated ? <TotalEmployees /> : <Navigate to="/login" replace />} />
                <Route path="/total-forms" element={isAuthenticated ? <TotalForms /> : <Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Container>
        </Box>
      </UserProvider>
    </>
  );
}

export default App;
