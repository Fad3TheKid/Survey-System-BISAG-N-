import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
import EmployeeNavbar from './components/EmployeeNavbar';

function Nav() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || 'employee';

  if (!isAuthenticated) {
    return null;
  }

  // Remove hiding nav bar on the create form page (/create)
  // if (location.pathname === '/create') {
  //   return null;
  // }

  // Render nav bar based on user role
  const NavbarComponent = userRole === 'admin' ? AdminNavbar : EmployeeNavbar;

  return (
    <div>
      <NavbarComponent />
    </div>
  );
}

export default Nav;
