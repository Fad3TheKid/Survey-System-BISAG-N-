import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Pagination,
  Snackbar,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { formService, authService } from '../services/api';

const TotalForms = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('completed'); // 'ongoing' or 'completed'
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [userLevel, setUserLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [page, setPage] = useState(1);

  const formsPerPage = 10;

  const fetchUserProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUserLevel(profile.level || '');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formService.getAllForms();
      setForms(data);
      setPage(1);
    } catch (err) {
      console.error('Error fetching forms:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Unauthorized access. Please login again.');
        setSnackbar({ open: true, message: 'Unauthorized access. Please login again.', severity: 'error' });
      } else {
        setError('Failed to fetch forms');
        setSnackbar({ open: true, message: 'Failed to fetch forms', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchForms();
  }, []);

  useEffect(() => {
    if (userLevel) {
      console.log('User level:', userLevel);
      const filtered = forms.filter((form) => {
        console.log('Form targetLevels:', form.targetLevels);
        if (!form.targetLevels) return false;
        // Convert both to strings for comparison
        return form.targetLevels.map(String).includes(String(userLevel));
      });
      setFilteredForms(filtered);
      setPage(1);
    } else {
      setFilteredForms(forms);
    }
  }, [userLevel, forms]);

  const pageCount = Math.ceil(
    filteredForms.filter((form) => (activeSection === 'ongoing' ? !form.isPublished : form.isPublished)).length /
      formsPerPage
  );
  const paginatedForms = filteredForms
    .filter((form) => (activeSection === 'ongoing' ? !form.isPublished : form.isPublished))
    .slice((page - 1) * formsPerPage, page * formsPerPage);

  const handleToggleSection = (section) => {
    setActiveSection(section);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePublishToggle = async (formId, publish) => {
    setLoading(true);
    try {
      await formService.publishForm(formId, publish);
      await fetchForms();
      setSnackbar({
        open: true,
        message: publish ? 'Form published successfully.' : 'Form unpublished successfully.',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update publish status.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center', backgroundColor: 'black', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
        Total Forms
      </Typography>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
        {activeSection === 'ongoing'
          ? `Number of Ongoing Forms: ${forms.filter((form) => !form.isPublished).length}`
          : `Number of Completed Forms: ${forms.filter((form) => form.isPublished).length}`}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ButtonGroup variant="outlined">
          <Button
            variant={activeSection === 'ongoing' ? 'contained' : 'outlined'}
            onClick={() => handleToggleSection('ongoing')}
          >
            Completed Forms
          </Button>
          <Button
            variant={activeSection === 'completed' ? 'contained' : 'outlined'}
            onClick={() => handleToggleSection('completed')}
          >
            Ongoing Forms
          </Button>
        </ButtonGroup>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : filteredForms.length === 0 ? (
        <Typography sx={{ color: 'white' }}>
          No {activeSection === 'ongoing' ? 'ongoing' : 'completed'} forms found.
        </Typography>
      ) : (
        <Box
          sx={{
            maxHeight: 700,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {paginatedForms.map((form, index) => (
            <Card
              key={form._id}
              elevation={1}
              sx={{
                width: '100%',
                maxWidth: 900,
                minHeight: 200,
                backgroundColor: '#222',
                color: 'white',
                borderRadius: 2,
                boxShadow: 3,
                mb: 1,
              }}
            >
              <CardContent
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#222',
                  color: 'white',
                }}
              >
                <Typography variant="h6" sx={{ mr: 2 }}>
                  {(page - 1) * formsPerPage + index + 1}.
                </Typography>
                <Box>
                  <Typography variant="h6">{form.title}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Created on: {format(new Date(form.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                  {activeSection === 'completed' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/edit-form/${form._id}`}
                        sx={{ mr: 1, color: 'blue', borderColor: 'blue' }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handlePublishToggle(form._id, false)}
                        disabled={loading}
                        sx={{ color: 'red', borderColor: 'red' }}
                      >
                        Unpublish
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
};

export default TotalForms;

