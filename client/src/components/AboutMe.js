import React, { useEffect, useState, useContext } from 'react';
import {
  Button,
  Drawer,
  Typography,
  TextField,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { authService } from '../services/api';
import { UserContext } from '../contexts/UserContext';

const AboutMe = () => {
  const { profile, refreshProfile } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    dateOfJoining: '',
    department: '',
    level: '',
    designation: '',
    reportingAuthorityName: '',
    reportingAuthorityDepartment: '',
    reportingAuthorityLevel: '',
    reportingAuthorityDesignation: '',
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
  };

  useEffect(() => {
    if (open && profile) {
      setFormData({
        employeeName: profile.employeeName || '',
        employeeId: profile.employeeId || '',
        dateOfJoining: profile.dateOfJoining ? profile.dateOfJoining.split('T')[0] : '',
        department: profile.department || '',
        level: profile.level || '',
        designation: profile.designation || '',
        reportingAuthorityName: profile.reportingAuthorityName || '',
        reportingAuthorityDepartment: profile.reportingAuthorityDepartment || '',
        reportingAuthorityLevel: profile.reportingAuthorityLevel || '',
        reportingAuthorityDesignation: profile.reportingAuthorityDesignation || '',
      });
    }
  }, [open, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      await authService.updateProfile(formData);
      await refreshProfile();
      setEditMode(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpen}
        startIcon={<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="black"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
        sx={{
          color: 'black',
          fontWeight: 'bold',
          textTransform: 'none',
          borderColor: 'white',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderColor: 'white',
          },
        }}
      >
        About Me
      </Button>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ width: 400, p: 3, position: 'relative' }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            About Me
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {profile ? (
            <form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Employee Name"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Employee ID"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Date of Joining"
                    name="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Department Name"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Department Level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reporting Authority Name"
                    name="reportingAuthorityName"
                    value={formData.reportingAuthorityName}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reporting Authority Department Name"
                    name="reportingAuthorityDepartment"
                    value={formData.reportingAuthorityDepartment}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reporting Authority Level"
                    name="reportingAuthorityLevel"
                    value={formData.reportingAuthorityLevel}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reporting Authority Designation"
                    name="reportingAuthorityDesignation"
                    value={formData.reportingAuthorityDesignation}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                {!editMode ? (
                  <Button variant="contained" onClick={handleEdit}>
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" color="primary" onClick={handleSave}>
                      Save
                    </Button>
                    <Button variant="outlined" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </form>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default AboutMe;

