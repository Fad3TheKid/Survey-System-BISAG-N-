import React, { useEffect, useState } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import api, { authService, employeeService } from '../services/api';
import { toStr } from '../utils/idUtils';

const FillSurveys = () => {
  const [activeSection, setActiveSection] = useState('remaining');
  const [forms, setForms] = useState([]);
  const [filledFormIds, setFilledFormIds] = useState(new Set());
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [employeeProfileExists, setEmployeeProfileExists] = useState(false);
  const [userLevel, setUserLevel] = useState('');  // Added missing userLevel state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // FIXED: Helper function to fetch filled responses
  const fetchFilledResponses = async () => {
    try {
      if (!employeeProfile || !employeeProfile.email) {
        setFilledFormIds(new Set());
        return;
      }
      const email = employeeProfile.email;
      const responsesResponse = await api.get(`/responses?respondentEmail=${encodeURIComponent(email)}`);
      const responses = responsesResponse.data || responsesResponse;
      if (!Array.isArray(responses)) {
        setFilledFormIds(new Set());
        return;
      }
      const filledIds = new Set(
        responses.map((resp) =>
          toStr(resp.formId || resp.form_id)
        )
      );
      console.log('Updated filledFormIds:', Array.from(filledIds));
      setFilledFormIds(filledIds);
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    }
  };

  // Check query param to set active section on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    console.log('FillSurveys: URLSearchParams:', params.toString());
    if (params.get('submitted') === 'true') {
      console.log('FillSurveys: submitted=true detected, setting activeSection to filled');
      setActiveSection('filled');
      // Remove the query param from URL after setting active section
      const url = new URL(window.location);
      url.searchParams.delete('submitted');
      window.history.replaceState({}, '', url.toString());
    }
  }, [location.search]);

  // Listen to formSubmitted event and refresh
  useEffect(() => {
    const handleFormSubmit = async (event) => {
      const formId = event?.detail?.formId;
      console.log('formSubmitted event received with formId:', formId);
      if (formId) {
        console.log('Current filledFormIds before update:', Array.from(filledFormIds));
        setFilledFormIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(formId);
          console.log('Updated filledFormIds after adding formId:', Array.from(newSet));
          return newSet;
        });
        setRefreshKey((prev) => prev + 1); 
        setTimeout(async () => {
          await fetchFilledResponses(); 
          await fetchTargetedForms(); 
          setActiveSection('filled'); 
        }, 1000);
      }
    };

    window.addEventListener('formSubmitted', handleFormSubmit);
    return () => {
      window.removeEventListener('formSubmitted', handleFormSubmit);
    };
  }, [filledFormIds]);

  // New helper to fetch targeted forms
  const fetchTargetedForms = async () => {
    try {
      if (!employeeProfile) {
        setForms([]);
        return;
      }
      const token = localStorage.getItem('token');
      const formsResponse = await api.get('/employee/targeted-forms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const targetedForms = formsResponse.data || formsResponse;
      if (Array.isArray(targetedForms)) {
        console.log('Fetched targeted forms:', targetedForms.map(f => f._id.toString()));
        setForms(targetedForms);
        console.log('Employee profile level:', employeeProfile?.level);
      } else {
        setForms([]);
      }
    } catch (err) {
      console.error('Error fetching targeted forms:', err);
      setForms([]);
    }
  };

  // Update useEffect to use fetchTargetedForms
  useEffect(() => {
    const checkEmployeeProfile = async () => {
      try {
        if (!employeeProfile) {
          setEmployeeProfileExists(false);
          return;
        }
        const fullProfile = await employeeService.getMyProfile();
        if (fullProfile) {
          setEmployeeProfileExists(true);
        } else {
          setEmployeeProfileExists(false);
        }
        setForms([]);
        setLoading(true);
        await fetchTargetedForms();

        // Set user level here explicitly for use in filtering
        if (fullProfile && fullProfile.level) {
          setUserLevel(fullProfile.level);
        } else {
          setUserLevel('');
        }

        setLoading(false);
      } catch (err) {
        setEmployeeProfileExists(false);
        setForms([]);
        setLoading(false);
        console.error('Error fetching full employee profile:', err);
      }
    };

    checkEmployeeProfile();
  }, [employeeProfile]);

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setEmployeeProfile(profile);
      } catch (error) {
        console.error('Failed to fetch employee profile:', error);
      }
    };

    fetchEmployeeProfile();
  }, []);

  useEffect(() => {
    const checkEmployeeProfile = async () => {
      try {
        if (!employeeProfile) {
          setEmployeeProfileExists(false);
          return;
        }
        const fullProfile = await employeeService.getMyProfile();
        setEmployeeProfileExists(true);
        setForms([]);
        setLoading(true);
        const token = localStorage.getItem('token');
        const formsResponse = await api.get('/employee/targeted-forms', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const targetedForms = formsResponse.data || formsResponse;
        if (Array.isArray(targetedForms)) {
          setForms(targetedForms);
        } else {
          setForms([]);
        }
        setLoading(false);
      } catch (err) {
        setEmployeeProfileExists(false);
        setForms([]);
        setLoading(false);
        console.error('Error fetching full employee profile:', err);
      }
    };

    checkEmployeeProfile();
  }, [employeeProfile]);

  useEffect(() => {
    fetchFilledResponses(); // Initial fetch on load
  }, []);

  const handleToggle = (section) => {
    setActiveSection(section);
  };

  // Filter based on active section
  const displayedForms = forms.filter((form) => {
    const isFilled = filledFormIds.has(toStr(form._id));
    console.log(`Form ${form._id} titled "${form.title}" isFilled: ${isFilled}, isPublished: ${form.isPublished}`);
    return (
      (activeSection === 'remaining' ? !isFilled : isFilled) &&
      form.isPublished !== false
    );
  });

  return (
    <Box key={refreshKey} sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Fill Surveys
      </Typography>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          color: 'black',
          display: 'inline-block',
          borderRadius: 1,
          mb: 1,
        }}
      >
        {activeSection === 'remaining'
          ? `Number of Remaining Surveys: ${forms.filter((form) => !filledFormIds.has(toStr(form._id))).length}`
          : `Number of Filled Surveys: ${forms.filter((form) => filledFormIds.has(toStr(form._id))).length}`}
      </Typography>

      <Box sx={{ mt: 1, mb: 3 }}>
        <ButtonGroup variant="outlined">
          <Button
            variant={activeSection === 'remaining' ? 'contained' : 'outlined'}
            onClick={() => handleToggle('remaining')}
          >
            Remaining Surveys
          </Button>
          <Button
            variant={activeSection === 'filled' ? 'contained' : 'outlined'}
            onClick={() => handleToggle('filled')}
          >
            Filled Surveys
          </Button>
        </ButtonGroup>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : !employeeProfileExists ? (
        <Typography>
          Fill the Employee Registration Form to access this page.
        </Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : displayedForms.length === 0 ? (
        <Typography>
          No {activeSection === 'remaining' ? 'remaining' : 'filled'} surveys to
          display.
        </Typography>
      ) : (
      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 2,
          justifyContent: 'center',
          padding: 1,
        }}
      >
        {displayedForms.map((form) => (
          <Card key={form._id} sx={{ width: '100%', maxWidth: 320, boxShadow: 3, borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'left' }}>
              <Typography variant="h6" noWrap title={form.title}>{form.title}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {form.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate(`/form/${form._id}`)}
              >
                Fill Form
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      )}
    </Box>
  );
};

export default FillSurveys;
