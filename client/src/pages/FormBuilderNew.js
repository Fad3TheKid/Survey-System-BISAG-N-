import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  FormControlLabel,
  Switch as MuiSwitch,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QuestionCard from '../components/QuestionCard';
import { masterDataService, formService } from '../services/api';

const FormBuilderNew = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [formTitle, setFormTitle] = useState('Untitled form');
  const [formDescription, setFormDescription] = useState('');
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  const [tempSelectedLevels, setTempSelectedLevels] = useState([]);
  const [tempSelectedDesignations, setTempSelectedDesignations] = useState([]);
  const [tempSelectedDepartments, setTempSelectedDepartments] = useState([]);

  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const [selectionConfirmed, setSelectionConfirmed] = useState(false);
  const [selectionDone, setSelectionDone] = useState(false);

  const [levelToDesignationsMap, setLevelToDesignationsMap] = useState({});
  const [levelToDepartmentsMap, setLevelToDepartmentsMap] = useState({});

  const [submitLoading, setSubmitLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptData = await masterDataService.getDepartments();
        setDepartments(deptData);
        setFilteredDepartments(deptData);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
      try {
        const levelData = await masterDataService.getLevels();
        setLevels(levelData);
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
      try {
        const desigData = await masterDataService.getDesignations();
        setDesignations(desigData);
        setFilteredDesignations(desigData);
      } catch (error) {
        console.error('Error fetching designations:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const levelDesigMap = {};
    designations.forEach((desig) => {
      const key = desig.levelId || desig.level_id || desig.level;
      if (!levelDesigMap[key]) {
        levelDesigMap[key] = [];
      }
      levelDesigMap[key].push(desig);
    });
    setLevelToDesignationsMap(levelDesigMap);

    const levelDeptMap = {};
    departments.forEach((dept) => {
      const key = dept.levelCategory;
      if (!key) {
        console.warn('Department missing levelCategory:', dept);
        return;
      }
      if (!levelDeptMap[key]) {
        levelDeptMap[key] = [];
      }
      levelDeptMap[key].push(dept);
    });
    setLevelToDepartmentsMap(levelDeptMap);
  }, [designations, departments]);

  useEffect(() => {
    if (tempSelectedLevels.length === 0) {
      setFilteredDesignations(designations);
      setFilteredDepartments(departments);
    } else {
      const selectedLevelNames = tempSelectedLevels
        .map((levelId) => {
          const levelObj = levels.find((lvl) => lvl.level_id === levelId);
          return levelObj ? levelObj.name : null;
        })
        .filter((name) => name !== null);

      const filteredDesigs = tempSelectedLevels.flatMap(
        (levelId) => levelToDesignationsMap[levelId] || []
      );
      const filteredDepts = selectedLevelNames.flatMap(
        (levelName) => levelToDepartmentsMap[levelName] || []
      );

      setFilteredDesignations(filteredDesigs);
      setFilteredDepartments(filteredDepts);
    }
  }, [
    tempSelectedLevels,
    levelToDesignationsMap,
    levelToDepartmentsMap,
    designations,
    departments,
    levels,
  ]);

  const toggleTempLevel = (levelId) => {
    if (tempSelectedLevels.includes(levelId)) {
      setTempSelectedLevels(tempSelectedLevels.filter((id) => id !== levelId));
    } else {
      setTempSelectedLevels([...tempSelectedLevels, levelId]);
    }
  };

  const toggleTempDesignation = (desigId) => {
    if (tempSelectedDesignations.includes(desigId)) {
      setTempSelectedDesignations(tempSelectedDesignations.filter((id) => id !== desigId));
    } else {
      setTempSelectedDesignations([...tempSelectedDesignations, desigId]);
    }
  };

  const toggleTempDepartment = (deptId) => {
    if (tempSelectedDepartments.includes(deptId)) {
      setTempSelectedDepartments(tempSelectedDepartments.filter((id) => id !== deptId));
    } else {
      setTempSelectedDepartments([...tempSelectedDepartments, deptId]);
    }
  };

  const handleDoneSelection = () => {
    setSelectedLevels(tempSelectedLevels);
    setSelectedDesignations(tempSelectedDesignations);
    setSelectedDepartments(tempSelectedDepartments);
    setSelectionDone(true);
  };

  const handleConfirmSelection = () => {
    if (selectedLevels.length === 0) {
      alert('Please select at least one level.');
      return;
    }
    setSelectionConfirmed(true);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      title: '',
      type: 'text',
      options: [],
      required: false,
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const updateQuestion = (index, updatedQuestion) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = updatedQuestion;
      return newQuestions;
    });
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSubmitForm = async () => {
    if (!formTitle || formTitle.trim().length === 0) {
      alert('Form title is required');
      return;
    }
    if (formTitle.length > 200) {
      alert('Form title must be at most 200 characters');
      return;
    }
    if (!questions || questions.length === 0) {
      alert('Form must contain at least one question');
      return;
    }
    for (const q of questions) {
      if (!q.title || q.title.trim().length === 0) {
        alert('Each question must have a title');
        return;
      }
      if (q.title.length > 500) {
        alert('Question title must be at most 500 characters');
        return;
      }
      if (
        !q.type ||
        ![
          'short',
          'paragraph',
          'multiple',
          'checkbox',
          'dropdown',
          'linear',
          'grid',
          'email',
          'number',
          'phone',
          'url',
          'checkboxGrid',
          'date',
          'time',
        ].includes(q.type)
      ) {
        alert('Each question must have a valid type');
        return;
      }
    }
    setSubmitLoading(true);
    try {
      const creatorId = localStorage.getItem('userId') || 'default-creator-id';
    // Transform options from strings to {text, value} objects for questions with options
    const transformedQuestions = questions.map(q => {
      let newSettings = q.settings;
      if (q.settings && q.settings.grid && Array.isArray(q.settings.grid.rows)) {
        // Transform rows from objects to strings (labels) for all grid types
        const newRows = q.settings.grid.rows.map(row => {
          if (typeof row === 'string') return row;
          if (row && typeof row.label === 'string') return row.label;
          return '';
        });
        newSettings = {
          ...q.settings,
          grid: {
            ...q.settings.grid,
            rows: newRows,
          },
        };
      }
      let newOptions = q.options;
      if (q.options && Array.isArray(q.options)) {
        newOptions = q.options.map(opt => {
          if (typeof opt === 'string') {
            return { text: opt, value: opt };
          }
          return opt;
        });
      }
      return {
        ...q,
        settings: newSettings,
        options: newOptions,
      };
    });

    const formData = {
      title: formTitle,
      description: formDescription,
      questions: transformedQuestions,
      createdBy: creatorId,
      isPublished: false,
      targetLevels: selectedLevels,
      targetDesignations: selectedDesignations,
      targetDepartments: selectedDepartments,
    };

    if (formData._id) {
      // Update existing form
      const response = await formService.updateForm(formData._id, formData);
      const formId = response._id || response.id;
      const link = `${window.location.origin}/form/${formId}`;
      setShareLink(link);
      alert('Form updated successfully! Share this link: ' + link);
    } else {
      // Create new form
      const response = await formService.createForm(formData);
      const formId = response._id || response.id;
      const link = `${window.location.origin}/form/${formId}`;
      setShareLink(link);
      alert('Form created successfully! Share this link: ' + link);
    }
    } catch (error) {
      alert('Failed to save form: ' + error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#f8f8f8',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        fontFamily: "'Roboto', sans-serif",
        color: 'black',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowX: 'hidden',
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        centered
        sx={{
          bgcolor: '#f3e5f5',
          borderBottom: '3px solid #673ab7',
          '& .MuiTabs-indicator': {
            backgroundColor: '#673ab7',
            height: 4,
            borderRadius: 2,
          },
          fontWeight: 'bold',
          fontSize: 16,
          color: 'black',
          '& .MuiTab-root': {
            color: 'black',
          },
          '& .Mui-selected': {
            color: 'black',
          },
        }}
      >
        <Tab label="Questions" sx={{ textTransform: 'none', px: 3 }} />
        <Tab label="Responses" sx={{ textTransform: 'none', px: 3 }} />
        <Tab label="Settings" sx={{ textTransform: 'none', px: 3 }} />
      </Tabs>

      {tabIndex === 0 && (
        <Box sx={{ width: '100%', mx: 'auto', mb: 6 }}>
          {!selectionDone ? (
            <>
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Box
                  sx={{
                    flex: 1,
                    bgcolor: '#fff',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #ddd',
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Levels
                  </Typography>
                  {levels.length === 0 ? (
                    <Typography>No levels found.</Typography>
                  ) : (
                    levels.map((level) => (
                      <FormControlLabel
                        key={level.level_id}
                        sx={{ display: 'block' }}
                        control={
                          <input
                            type="checkbox"
                            checked={tempSelectedLevels.includes(level.level_id)}
                            onChange={() => toggleTempLevel(level.level_id)}
                          />
                        }
                        label={level.name}
                      />
                    ))
                  )}
                </Box>
                {tempSelectedLevels.length > 0 && (
                  <>
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: '#fff',
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #ddd',
                        maxHeight: 200,
                        overflowY: 'auto',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Designations
                      </Typography>
                      {filteredDesignations.length === 0 ? (
                        <Typography>No designations found.</Typography>
                      ) : (
                        filteredDesignations.map((desig) => (
                          <FormControlLabel
                            key={desig.desig_id}
                            sx={{ display: 'block' }}
                            control={
                              <input
                                type="checkbox"
                                checked={tempSelectedDesignations.includes(desig.desig_id)}
                                onChange={() => toggleTempDesignation(desig.desig_id)}
                              />
                            }
                            label={desig.name}
                          />
                        ))
                      )}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: '#fff',
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #ddd',
                        maxHeight: 200,
                        overflowY: 'auto',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Departments
                      </Typography>
                      {filteredDepartments.length === 0 ? (
                        <Typography>No departments found.</Typography>
                      ) : (
                        filteredDepartments.map((dept) => (
                          <FormControlLabel
                            key={dept.dept_id}
                            sx={{ display: 'block' }}
                            control={
                              <input
                                type="checkbox"
                                checked={tempSelectedDepartments.includes(dept.dept_id)}
                                onChange={() => toggleTempDepartment(dept.dept_id)}
                              />
                            }
                            label={dept.name}
                          />
                        ))
                      )}
                    </Box>
                  </>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" onClick={handleDoneSelection} disabled={tempSelectedLevels.length === 0}>
                  Done
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Selected Summary
              </Typography>
              <Box sx={{ mb: 3, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLevels.map((levelId) => {
                      const level = levels.find((lvl) => lvl.level_id === levelId);
                      return (
                        <tr key={`level-${levelId}`}>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Level</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{level ? level.name : levelId}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setSelectedLevels(selectedLevels.filter((id) => id !== levelId))}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {selectedDesignations.map((desigId) => {
                      const desig = designations.find((d) => d.desig_id === desigId);
                      return (
                        <tr key={`desig-${desigId}`}>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Designation</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{desig ? desig.name : desigId}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setSelectedDesignations(selectedDesignations.filter((id) => id !== desigId))}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {selectedDepartments.map((deptId) => {
                      const dept = departments.find((d) => d.dept_id === deptId);
                      return (
                        <tr key={`dept-${deptId}`}>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>Department</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dept ? dept.name : deptId}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setSelectedDepartments(selectedDepartments.filter((id) => id !== deptId))}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" color="primary" onClick={handleConfirmSelection}>
                  Confirm
                </Button>
                <Button variant="outlined" sx={{ ml: 2 }} onClick={() => { setSelectionDone(false); setSelectionConfirmed(false); }}>
                  Edit
                </Button>
              </Box>
            </>
          )}

          {selectionConfirmed && (
            <>
              <Box sx={{ mb: 4, p: 3, border: '1px solid #ddd', borderRadius: 4, bgcolor: '#fff' }}>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Untitled form"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    style: { color: 'black', fontSize: 28, fontWeight: 'bold' },
                  }}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Form description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  InputProps={{ disableUnderline: true, style: { color: 'black', fontSize: 16 } }}
                  multiline
                  sx={{ mb: 1 }}
                />
              </Box>

              <Button variant="outlined" startIcon={<AddIcon />} sx={{ mb: 2, ml: 3 }} onClick={addQuestion}>
                Add question
              </Button>

              {questions.map((question, idx) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={idx}
                  onUpdate={(updatedQuestion) => updateQuestion(idx, updatedQuestion)}
                  onDelete={() => deleteQuestion(question.id)}
                  onDuplicate={() => {
                    const newQuestion = { ...question, id: Date.now() };
                    setQuestions([...questions, newQuestion]);
                  }}
                />
              ))}

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleSubmitForm} disabled={submitLoading}>
                  {submitLoading ? 'Submitting...' : 'Submit Form'}
                </Button>
              </Box>

              {shareLink && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body1">Share this link to collect responses:</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', color: 'blue' }}>
                    {shareLink}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ width: '100%', mx: 'auto', p: 3, color: 'black' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Responses
          </Typography>
          <Typography>This section is under construction.</Typography>
        </Box>
      )}

      {tabIndex === 2 && (
        <Box sx={{ width: '100%', mx: 'auto', p: 3, color: 'black' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Settings
          </Typography>

          <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1, color: 'black' }}>
            <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Departments</Typography>
            {departments.length === 0 ? (
              <Typography>No departments found.</Typography>
            ) : (
              <ul>
                {departments.map((dept) => (
                  <li key={dept.dept_id}>
                    {dept.name} (Level Category: {dept.levelCategory})
                  </li>
                ))}
              </ul>
            )}
          </Box>

          <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1, color: 'black' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 'bold' }}>Make this a quiz</Typography>
              <MuiSwitch />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Assign point values, set answers, and automatically provide feedback
            </Typography>
          </Box>

          <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1, color: 'black' }}>
            <Typography sx={{ fontWeight: 'bold', mb: 1, color: 'black' }}>Responses</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'black' }} component="div">
              Manage how responses are collected and protected
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 'bold' }}>Collect email addresses</Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  Respondents will be required to sign in to Google
                </Typography>
              </Box>
              <Box sx={{ minWidth: 120 }}>
                <Select
                  size="small"
                  defaultValue="Verified"
                  fullWidth
                  sx={{ backgroundColor: 'black', color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
                >
                  <MenuItem value="Verified" sx={{ color: 'black' }}>Verified</MenuItem>
                  <MenuItem value="Unverified" sx={{ color: 'black' }}>Unverified</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 'bold' }}>Send responders a copy of their response</Typography>
              <Box sx={{ minWidth: 120 }}>
                <Select size="small" defaultValue="Off" fullWidth>
                  <MenuItem value="Off">Off</MenuItem>
                  <MenuItem value="On">On</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontWeight: 'bold' }}>Allow response editing</Typography>
              <MuiSwitch />
            </Box>

            <Typography variant="overline" color="text.secondary" sx={{ mb: 1 }}>
              REQUIRES SIGN IN
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 'bold' }}>Limit to 1 response</Typography>
              <MuiSwitch />
            </Box>
          </Box>

          <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1, color: 'black' }}>
            <Typography sx={{ fontWeight: 'bold', mb: 1, color: 'black' }}>Presentation</Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'black' }}>
              Manage how the form and responses are presented
            </Typography>

            <Box sx={{ minWidth: 120 }}>
              <Typography color="black">
                <Select size="small" defaultValue="Show progress bar" fullWidth>
                  <MenuItem value="Show progress bar">Show progress bar</MenuItem>
                  <MenuItem value="Hide progress bar">Hide progress bar</MenuItem>
                </Select>
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography>Shuffle question order</Typography>
              <MuiSwitch />
            </Box>

            <Typography sx={{ fontWeight: 'bold', fontSize: 12, mb: 1, mt: 3 }}>AFTER SUBMISSION</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography>Confirmation message</Typography>
              <Button size="small" variant="text" sx={{ textTransform: 'none' }}>
                Edit
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Your response has been recorded
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography>Show link to submit another response</Typography>
              <MuiSwitch defaultChecked />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>View results summary</Typography>
              <MuiSwitch />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FormBuilderNew;