import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService, authService } from '../services/api';
import {
  Box,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormGroup,
  Select,
  MenuItem,
} from '@mui/material';

const FormView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const questionBoxStyle = {
    mb: 3,
    backgroundColor: '#ffffff',
    padding: 2,
    borderRadius: 2,
    boxShadow: 1,
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await formService.getFormById(formId);
        setForm(data);
      } catch (error) {
        alert('Failed to load form: ' + error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUserEmail(profile.email || '');
        setUserLevel(profile.level || '');
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchForm();
    fetchUserProfile();
  }, [formId]);

  const handleChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      const answersArray = form.questions.map((question) => ({
        questionId: question._id,
        type: question.type,
        value: responses[question._id] || '',
        timestamp: new Date(),
      }));

      const responsePayload = {
        formId,
        answers: answersArray,
        respondentEmail: userEmail,
      };

      await formService.submitResponse(responsePayload);
      alert('Response submitted successfully!');
      window.dispatchEvent(new CustomEvent('formSubmitted', { detail: { formId } }));
      navigate('/fill-surveys');
    } catch (error) {
      alert('Failed to submit response: ' + error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Typography>Loading form...</Typography>;

  if (!form) {
    window.location.href = '/employee-dashboard';
    return null;
  }

  if (form && userLevel && !form.targetLevels.includes(userLevel)) {
    alert('You are not authorized to view or fill this survey.');
    window.location.href = '/employee-dashboard';
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#aed3ff', py: 4 }}>
      <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
        <Typography variant="h4" gutterBottom>{form.title}</Typography>
        <Typography variant="subtitle1" gutterBottom>{form.description}</Typography>

        {form.questions
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((question, index) => {
            const value = responses[question._id] || '';
            const questionNumber = (currentPage - 1) * pageSize + index + 1;

            switch (question.type) {
              case 'short':
              case 'email':
              case 'number':
              case 'phone':
              case 'url':
                return (
                  <Box key={question._id} sx={questionBoxStyle}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {questionNumber}. {question.title}
                    </Typography>
                    <TextField
                      type={question.type === 'short' ? 'text' : question.type}
                      value={value}
                      onChange={(e) => handleChange(question._id, e.target.value)}
                      fullWidth
                      required={question.required}
                      variant="outlined"
                      size="small"
                      sx={{
                        backgroundColor: '#fff',
                        input: { color: '#000', border: '1px solid #ccc', borderRadius: 1 },
                      }}
                    />
                  </Box>
                );
              case 'paragraph':
                return (
                  <Box key={question._id} sx={questionBoxStyle}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {questionNumber}. {question.title}
                    </Typography>
                    <TextField
                      multiline
                      rows={4}
                      value={value}
                      onChange={(e) => handleChange(question._id, e.target.value)}
                      fullWidth
                      required={question.required}
                      variant="outlined"
                      size="small"
                      sx={{
                        backgroundColor: '#fff',
                        textarea: { color: '#000' },
                      }}
                    />
                  </Box>
                );
              case 'multiple':
                return (
                  <Box key={question._id} sx={questionBoxStyle}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {questionNumber}. {question.title}
                    </Typography>
                    <RadioGroup
                      value={value}
                      onChange={(e) => handleChange(question._id, e.target.value)}
                    >
                      {question.options.map((option) => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio required={question.required} />}
                          label={option.text}
                        />
                      ))}
                    </RadioGroup>
                  </Box>
                );
              case 'checkbox':
                return (
                  <Box key={question._id} sx={questionBoxStyle}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {questionNumber}. {question.title}
                    </Typography>
                    <FormGroup>
                      {question.options.map((option) => (
                        <FormControlLabel
                          key={option.value}
                          control={
                            <Checkbox
                              checked={value === option.value}
                              onChange={() => {
                                handleChange(question._id, option.value);
                              }}
                              sx={{
                                color: '#000',
                                '&.Mui-checked': {
                                  color: '#000',
                                },
                              }}
                            />
                          }
                          label={option.text}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                );
              case 'dropdown':
                return (
                  <Box key={question._id} sx={questionBoxStyle}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {questionNumber}. {question.title}
                    </Typography>
                    <Select
                      value={value}
                      onChange={(e) => handleChange(question._id, e.target.value)}
                      fullWidth
                      required={question.required}
                      size="small"
                      sx={{ backgroundColor: '#fff', color: '#000' }}
                    >
                      {question.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.text}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                );
              case 'checkboxGrid': {
                const rows = question.settings?.grid?.rows || [];
                const columns = question.settings?.grid?.columns || [];
                const value = responses[question._id] || {};

                const toggleCheckbox = (rowIndex, colIndex) => {
                  const newValue = { ...value };
                  if (!newValue[rowIndex]) {
                    newValue[rowIndex] = [];
                  }
                  if (newValue[rowIndex].includes(colIndex)) {
                    newValue[rowIndex] = newValue[rowIndex].filter((i) => i !== colIndex);
                  } else {
                    newValue[rowIndex].push(colIndex);
                  }
                  handleChange(question._id, newValue);
                };

                return (
                  <Box key={question._id} sx={questionBoxStyle}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {questionNumber}. {question.title}
                    </Typography>
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                          <tr>
                            <th></th>
                            {columns.map((col, colIndex) => (
                              <th key={colIndex} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row}</td>
                              {columns.map((_, colIndex) => (
                                <td key={colIndex} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                  <Checkbox
                                    checked={value[rowIndex]?.includes(colIndex) || false}
                                    onChange={() => toggleCheckbox(rowIndex, colIndex)}
                                    size="small"
                                    sx={{
                                      color: '#000',
                                      '&.Mui-checked': {
                                        color: '#000',
                                      },
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Box>
                );
              }
              case 'date':
                return (
                  <Box key={question._id} sx={questionBoxStyle}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {questionNumber}. {question.title}
                    </Typography>
                    <TextField
                      type="date"
                      value={value}
                      onChange={(e) => handleChange(question._id, e.target.value)}
                      fullWidth
                      required={question.required}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      sx={{
                        backgroundColor: '#fff',
                        input: { color: '#000' },
                      }}
                    />
                  </Box>
                );
              default:
                return null;
            }
          })}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Typography sx={{ alignSelf: 'center' }}>
            Page {currentPage} of {Math.ceil(form.questions.length / pageSize)}
          </Typography>
          <Button
            variant="outlined"
            disabled={currentPage === Math.ceil(form.questions.length / pageSize)}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(form.questions.length / pageSize)))}
          >
            Next
          </Button>
        </Box>

        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitLoading}>
          {submitLoading ? 'Submitting...' : 'Submit'}
        </Button>
        <Button variant="outlined" color="secondary" sx={{ ml: 2 }} onClick={() => window.location.href = '/fill-surveys'}>
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default FormView;
