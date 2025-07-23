import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Grid, Paper } from '@mui/material';
import { authService } from '../services/api';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Disable scroll on body
    document.body.style.overflow = 'hidden';

    // Fetch logged-in employee profile
    const fetchProfile = async () => {
      try {
        const profileData = await authService.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();

    return () => {
      // Re-enable scroll on unmount
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', backgroundColor: 'white', color: '#1a237e', mt: 6, p: 4, fontFamily: 'Arial, sans-serif', borderRadius: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
        {profile ? `Welcome, ${profile.name || profile.username}` : 'Employee Dashboard'}
      </Typography>

      <Grid container maxWidth={600} margin="auto" direction="column" spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ bgcolor: 'white', borderRadius: 4, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <HowToRegIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1a237e' }}>
                  Employee Registration Form
                </Typography>
                <Typography variant="body2" sx={{ color: 'gray' }}>
                  Fill out your registration details.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ fontWeight: 'bold' }}
              onClick={() => navigate('/employee-registration')}
            >
              Fill Form
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ bgcolor: 'white', borderRadius: 4, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FeedbackIcon sx={{ fontSize: 40, color: '#2196f3' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1a237e' }}>
                  Survey from Admin
                </Typography>
                <Typography variant="body2" sx={{ color: 'gray' }}>
                  Fill out available surveys to provide your feedback.
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              sx={{ fontWeight: 'bold' }}
              onClick={() => navigate('/fill-surveys')}
            >
              Fill Surveys
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
