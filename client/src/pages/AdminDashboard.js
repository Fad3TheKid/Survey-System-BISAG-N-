import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { authService } from '../services/api';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [profile, setProfile] = useState(null);

  // Dummy data for dashboard summary cards
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalForms: 0,
    totalResponses: 0,
  });

  useEffect(() => {
    // Disable scroll on body
    document.body.style.overflow = 'hidden';

    const fetchProfile = async () => {
      try {
        const profileData = await authService.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    // Fetch real summary data from API
    const fetchSummary = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/responses/summary');
        if (!response.ok) throw new Error('Failed to fetch summary');
        const data = await response.json();
        setSummary({
          totalEmployees: data.totalEmployees,
          totalForms: data.totalForms,
          totalResponses: data.totalResponses,
        });
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };

    fetchProfile();
    fetchSummary();

    return () => {
      // Re-enable scroll on unmount
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#000000', pt: 6, px: 4, pb: 4, fontFamily: 'Arial, sans-serif', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 3 }}>
        Welcome{profile ? `, ${profile.name || profile.username || 'Admin'}` : ''}
      </Typography>
      {/* Removed the "Welcome to the admin dashboard." text as per user request */}

      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2, gap: 4 }}>
        <Grid item xs={12} sm={4}>
          <Link to="/total-employees" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                backgroundColor: '#f0f4f8',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 0 10px 3px #4caf50',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#000000' }}>{summary.totalEmployees}</Typography>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ color: '#000000' }}>
                    Total Employees
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Link>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Link to="/total-forms" style={{ textDecoration: 'none' }}>
            <Card
              sx={{
                backgroundColor: '#f0f4f8',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 0 10px 3px #2196f3',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon sx={{ fontSize: 40, color: '#2196f3' }} />
                <Box>
                  <Typography variant="h5" sx={{ color: '#000000' }}>{summary.totalForms}</Typography>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ color: '#000000' }}>
                    Total Forms
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
