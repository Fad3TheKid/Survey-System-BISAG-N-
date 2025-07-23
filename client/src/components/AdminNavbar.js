import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Link, IconButton, Avatar, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.assign('/');
  };

  return (
    <AppBar position="static" sx={{ boxShadow: 3, backgroundColor: '#ffffff' }}>
      <Toolbar>
        <Link
          component={RouterLink}
          to="/"
          underline="none"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <img
            src="/img/bisag_logo.png"
            alt="BISAG-N Logo"
            style={{ height: 50, width: 'auto', marginTop: 4 }}
          />
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          color="primary"
          component={RouterLink}
          to="/create"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ mr: 2, textTransform: 'none', fontWeight: 'bold', color: '#003366' }}
        >
          Create Form
        </Button>
        <Button
          color="primary"
          component={RouterLink}
          to="/add-department"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ mr: 2, textTransform: 'none', fontWeight: 'bold', color: '#003366' }}
        >
          Add Dept.
        </Button>
        <Button
          color="primary"
          component={RouterLink}
          to="/employee-details"
          startIcon={<PeopleIcon />}
          sx={{ mr: 2, textTransform: 'none', fontWeight: 'bold', color: '#003366' }}
        >
          Employee Details
        </Button>
        <Button
          color="primary"
          component={RouterLink}
          to="/view-responses"
          startIcon={<ListAltIcon />}
          sx={{ mr: 2, textTransform: 'none', fontWeight: 'bold', color: '#003366' }}
        >
          View Responses
        </Button>

        <Tooltip title="Logout">
          <IconButton color="error" onClick={handleLogout} sx={{ ml: 1 }}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

export default AdminNavbar;
