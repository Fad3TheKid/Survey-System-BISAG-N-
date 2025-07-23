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
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import { masterDataService, formService } from '../services/api';

const EditForm = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [questions, setQuestions] = useState([]);

  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);

  const [tempSelectedLevels, setTempSelectedLevels] = useState([]);
  const [tempSelectedDepartments, setTempSelectedDepartments] = useState([]);
  const [tempSelectedDesignations, setTempSelectedDesignations] = useState([]);

  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);

  const [selectionDone, setSelectionDone] = useState(false);
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lvlData, deptData, desigData, formData] = await Promise.all([
          masterDataService.getLevels(),
          masterDataService.getDepartments(),
          masterDataService.getDesignations(),
          formService.getFormById(formId),
        ]);

        setLevels(lvlData);
        setDepartments(deptData);
        setFilteredDepartments(deptData);
        setDesignations(desigData);
        setFilteredDesignations(desigData);

        if (!formData) {
          setError('Form not found');
          setLoading(false);
          return;
        }

        setFormTitle(formData.title || '');
        setFormDescription(formData.description || '');
        setQuestions(formData.questions || []);

        // Normalize to arrays of IDs for pre-selection
        const normLevels = (formData.targetLevels || []).map((lvl) =>
          typeof lvl === 'object' ? lvl.level_id : lvl
        );
        const normDepartments = (formData.targetDepartments || []).map((dept) =>
          typeof dept === 'object' ? dept.dept_id : dept
        );
        const normDesignations = (formData.targetDesignations || []).map((desig) =>
          typeof desig === 'object' ? desig.desig_id : desig
        );

        setTempSelectedLevels(normLevels);
        setTempSelectedDepartments(normDepartments);
        setTempSelectedDesignations(normDesignations);

        setSelectedLevels(normLevels);
        setSelectedDepartments(normDepartments);
        setSelectedDesignations(normDesignations);

        setSelectionDone(true);
        setSelectionConfirmed(true);

        setLoading(false);
      } catch (err) {
        setError('Failed to load form data');
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  useEffect(() => {
    console.log('Levels count:', levels.length);
    console.log('Departments count:', departments.length);
    console.log('Designations count:', designations.length);
    console.log('Temp selected levels:', tempSelectedLevels);
    console.log('Filtered designations before filtering:', filteredDesignations);
    console.log('Filtered departments before filtering:', filteredDepartments);

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

      // Include all currently selected designations regardless of level filtering
      const filteredDesigs = [
        ...new Set([
          ...tempSelectedDesignations,
          ...tempSelectedLevels.flatMap((levelId) =>
            designations
              .filter(
                (desig) =>
                  desig.levelId === levelId ||
                  desig.level_id === levelId ||
                  (typeof desig.level === 'string' && desig.level === levelId) ||
                  (typeof desig.level === 'object' && desig.level !== null && desig.level._id === levelId)
              )
              .map((d) => d.desig_id)
          ),
        ]),
      ].map((desigId) => designations.find((d) => d.desig_id === desigId));

      // Include all currently selected departments regardless of level filtering
      const filteredDepts = [
        ...new Set([
          ...tempSelectedDepartments,
          ...departments
            .filter((dept) => selectedLevelNames.includes(dept.levelCategory))
            .map((d) => d.dept_id),
        ]),
      ].map((deptId) => departments.find((d) => d.dept_id === deptId));

      setFilteredDesignations(filteredDesigs);
      setFilteredDepartments(filteredDepts);
    }
  }, [tempSelectedLevels, tempSelectedDesignations, tempSelectedDepartments, designations, departments, levels]);

  const toggleTempLevel = (levelId) => {
    if (tempSelectedLevels.includes(levelId)) {
      setTempSelectedLevels(tempSelectedLevels.filter((id) => id !== levelId));
    } else {
      setTempSelectedLevels([...tempSelectedLevels, levelId]);
    }
  };

  const toggleTempDepartment = (deptId) => {
    console.log('Toggling department:', deptId);
    if (tempSelectedDepartments.includes(deptId)) {
      setTempSelectedDepartments(tempSelectedDepartments.filter((id) => id !== deptId));
    } else {
      setTempSelectedDepartments([...tempSelectedDepartments, deptId]);
    }
  };

  const toggleTempDesignation = (desigId) => {
    console.log('Toggling designation:', desigId);
    if (tempSelectedDesignations.includes(desigId)) {
      setTempSelectedDesignations(tempSelectedDesignations.filter((id) => id !== desigId));
    } else {
      setTempSelectedDesignations([...tempSelectedDesignations, desigId]);
    }
  };

  const handleDoneSelection = () => {
    setSelectedLevels(tempSelectedLevels);
    setSelectedDepartments(tempSelectedDepartments);
    setSelectedDesignations(tempSelectedDesignations);
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
    setQuestions((prev) => [...prev, { id: Date.now(), title: '', type: 'text', options: [], required: false }]);
  };

  const updateQuestion = (index, updatedQuestion) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? updatedQuestion : q)));
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSubmit = async () => {
    try {
      await formService.updateForm(formId, {
        title: formTitle,
        description: formDescription,
        questions,
        targetLevels: selectedLevels,
        targetDepartments: selectedDepartments,
        targetDesignations: selectedDesignations,
      });
      navigate('/total-forms');
    } catch (err) {
      setError('Failed to update form');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#f8f8f8', minHeight: '100vh' }}>
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} centered>
        <Tab label="Questions" />
        <Tab label="Responses" />
        <Tab label="Settings" />
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
                  {tempSelectedLevels.length === 0 ? (
                    <Typography>Select levels to see designations.</Typography>
                  ) : filteredDesignations.length === 0 ? (
                    <Typography>No designations found.</Typography>
                  ) : (
                    filteredDesignations.map((desig) => {
                      const desigId = desig.desig_id;
                      return (
                        <FormControlLabel
                          key={desigId}
                          sx={{ display: 'block' }}
                          control={
                            <input
                              type="checkbox"
                              checked={tempSelectedDesignations.includes(desigId)}
                              onChange={() => toggleTempDesignation(desigId)}
                            />
                          }
                          label={desig ? desig.name : desigId}
                        />
                      );
                    })
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
                  {tempSelectedLevels.length === 0 ? (
                    <Typography>Select levels to see departments.</Typography>
                  ) : filteredDepartments.length === 0 ? (
                    <Typography>No departments found.</Typography>
                  ) : (
                    filteredDepartments.map((dept) => {
                      const deptId = dept.dept_id;
                      return (
                        <FormControlLabel
                          key={deptId}
                          sx={{ display: 'block' }}
                          control={
                            <input
                              type="checkbox"
                              checked={tempSelectedDepartments.includes(deptId)}
                              onChange={() => toggleTempDepartment(deptId)}
                            />
                          }
                          label={dept ? dept.name : deptId}
                        />
                      );
                    })
                  )}
                </Box>
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
                  rows={3}
                  sx={{ mb: 1 }}
                />
              </Box>

              <Button variant="outlined" startIcon={<Add />} sx={{ mb: 2, ml: 3 }} onClick={addQuestion}>
                Add question
              </Button>

              {questions.map((q, idx) => (
                <QuestionCard key={q.id} question={q} onUpdate={(newQ) => updateQuestion(idx, newQ)} onDelete={() => deleteQuestion(q.id)} />
              ))}

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="contained" onClick={handleSubmit}>
                  Update Form
                </Button>
              </Box>
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
          {/* Additional settings UI can be added here */}
        </Box>
      )}
    </Box>
  );
};

export default EditForm;
