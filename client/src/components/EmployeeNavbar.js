import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Link,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  Drawer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';
import { Assignment as AssignmentIcon, Logout as LogoutIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '../services/api';

function EmployeeNavbar() {
  const navigate = useNavigate();
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/employee/my-profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployeeProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch employee profile:', error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/masterData/departments');
        setDepartments(response.data || response);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Force full page reload to homepage to clear app state
    window.location.assign('/');
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={3} sx={{ boxShadow: 4, backgroundColor: 'white' }}>
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

          <Tooltip title="Fill Surveys">
            <Button
              variant="outlined"
              startIcon={<AssignmentIcon />}
              component={RouterLink}
              to="/fill-surveys"
              sx={{
                mx: 1,
                fontWeight: 'bold',
                textTransform: 'none',
                color: 'black',
                fontSize: '1rem',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderColor: 'white',
                },
              }}
            >
              Fill Surveys
            </Button>
          </Tooltip>

          {employeeProfile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, cursor: 'pointer' }} onClick={toggleDrawer(true)}>
              <Avatar sx={{ bgcolor: '#673ab7', width: 32, height: 32, mr: 1 }}>
                {employeeProfile.employeeName ? employeeProfile.employeeName.charAt(0).toUpperCase() : '?'}
              </Avatar>
              <Typography sx={{ color: 'black', fontWeight: 'bold', fontSize: '1rem' }}>
                {employeeProfile.employeeName || 'Employee'}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ color: 'black', ml: 2, fontWeight: 'bold', fontSize: '1rem' }}>
              Loading...
            </Typography>
          )}

          <Tooltip title="Logout">
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{
                mx: 1,
                color: 'red',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.15)',
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{ sx: { width: '20vw', minWidth: 300, padding: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">About Me</Typography>
          <IconButton onClick={toggleDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {employeeProfile ? (
          <TableContainer component={Paper}>
            <Table size="small" aria-label="employee profile table">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">Employee ID</TableCell>
                  <TableCell>{employeeProfile.employeeId || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Name</TableCell>
                  <TableCell>{employeeProfile.employeeName || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Date of Joining</TableCell>
                  <TableCell>{employeeProfile.dateOfJoining || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Department</TableCell>
                <TableCell>{departments.find(d => d.dept_id === employeeProfile.department)?.name || employeeProfile.department || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Level</TableCell>
                  <TableCell>{employeeProfile.level || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Designation</TableCell>
                  <TableCell>{employeeProfile.designation || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Reporting Authority Name</TableCell>
                  <TableCell>{employeeProfile.reportingAuthorityName || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Reporting Authority Department</TableCell>
                  <TableCell>{employeeProfile.reportingAuthorityDepartment || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Reporting Authority Level</TableCell>
                  <TableCell>{employeeProfile.reportingAuthorityLevel || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Reporting Authority Designation</TableCell>
                  <TableCell>{employeeProfile.reportingAuthorityDesignation || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Email</TableCell>
                  <TableCell>{employeeProfile.email || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>Loading profile details...</Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => alert('Edit functionality not implemented yet')}>
            Edit
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

export default EmployeeNavbar;
