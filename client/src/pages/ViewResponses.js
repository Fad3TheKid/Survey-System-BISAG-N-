import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { formService, masterDataService } from '../services/api';

const ViewResponses = () => {
  const [levels, setLevels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [responses, setResponses] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);

  const [formCountsByLevel, setFormCountsByLevel] = useState({});
  const [formCountsByDepartment, setFormCountsByDepartment] = useState({});
  const [formCountsByDesignation, setFormCountsByDesignation] = useState({});

  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);

  const [selectedResponse, setSelectedResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredResponseId, setHoveredResponseId] = useState(null);

  const [apiCountsByLevel, setApiCountsByLevel] = useState([]);

  // Fetch levels & departments and initial counts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [levelData, departmentData] = await Promise.all([
          masterDataService.getLevels(),
          masterDataService.getDepartments(),
        ]);
        setLevels(levelData);
        setDepartments(departmentData);

        // Fetch initial counts without filters
        const res = await formService.getResponsesWithFilters('');
        setApiCountsByLevel(res.countsByLevel || []);
        setFormCountsByDepartment(
          res.countsByDepartment?.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}) || {}
        );
        setFormCountsByDesignation(
          res.countsByDesignation?.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}) || {}
        );
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Map countsByLevel keys (level_id) to level._id keys when levels or apiCountsByLevel changes
  useEffect(() => {
    if (levels.length === 0 || apiCountsByLevel.length === 0) {
      setFormCountsByLevel({});
      return;
    }
    const levelIdMap = {};
    levels.forEach(lvl => {
      if (lvl.level_id) {
        levelIdMap[lvl.level_id] = lvl._id;
      }
    });
    const mappedCounts = {};
    apiCountsByLevel.forEach(item => {
      const key = levelIdMap[item._id] || item._id;
      mappedCounts[key] = item.count;
    });
    setFormCountsByLevel(mappedCounts);
  }, [levels, apiCountsByLevel]);

  // Filter departments when levels change
  useEffect(() => {
    const selectedLevelNames = selectedLevels
      .map((levelId) => {
        const lvl = levels.find((l) => l._id === levelId);
        return lvl ? lvl.name : null;
      })
      .filter(Boolean);

    const filtered = departments.filter((d) =>
      selectedLevelNames.includes(d.levelCategory)
    );
    setFilteredDepartments(filtered);
    setSelectedDepartments((prev) =>
      prev.filter((id) => filtered.some((d) => d.dept_id === id))
    );
  }, [selectedLevels, departments, levels]);

  // Fetch designations when departments change
  useEffect(() => {
    const fetchDesignations = async () => {
      if (selectedDepartments.length === 0) {
        setFilteredDesignations([]);
        setSelectedDesignations([]);
        return;
      }

      const all = [];
      for (let deptId of selectedDepartments) {
        try {
          const res = await masterDataService.getDesignations(deptId);
          all.push(...res);
        } catch (err) {
          console.error('Error fetching designations:', err);
        }
      }

      const unique = Object.values(
        all.reduce((acc, item) => {
          acc[item.desig_id] = item;
          return acc;
        }, {})
      );

      setFilteredDesignations(unique);
    };

    fetchDesignations();
  }, [selectedDepartments]);

  // Fetch responses when any filter changes
  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true);
      console.log('Fetching responses with filters:', {
        selectedLevels,
        selectedDepartments,
        selectedDesignations,
      });
      try {
        if (
          selectedLevels.length === 0 ||
          selectedDepartments.length === 0 ||
          selectedDesignations.length === 0
        ) {
          console.log('Not all filters selected, clearing responses');
          setResponses([]);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();

        // Map selectedLevels _id to level_id or name stored in form.targetLevels
        const levelObj = levels.find(l => l._id === selectedLevels[0]);
        const levelVal = levelObj ? (levelObj.level_id || levelObj.name || selectedLevels[0]) : selectedLevels[0];
        params.append('level', levelVal);

        // Map selectedDepartments dept_id to string stored in form.targetDepartments
        const deptObj = departments.find(d => d.dept_id === selectedDepartments[0]);
        const deptVal = deptObj ? (deptObj.dept_id || deptObj.name || selectedDepartments[0]) : selectedDepartments[0];
        params.append('department', deptVal);

        // Map selectedDesignations desig_id to string stored in form.targetDesignations
        const desigObj = designations.find(desig => desig.desig_id === selectedDesignations[0]);
        const desigVal = desigObj ? (desigObj.desig_id || desigObj.name || selectedDesignations[0]) : selectedDesignations[0];
        params.append('designation', desigVal);

        const res = await formService.getResponsesWithFilters(params.toString());
        console.log('Response from API:', res);
        setResponses(res.responses || res);
        setFormCountsByLevel(
          res.countsByLevel?.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}) || {}
        );
        setFormCountsByDepartment(
          res.countsByDepartment?.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}) || {}
        );
        setFormCountsByDesignation(
          res.countsByDesignation?.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}) || {}
        );
      } catch (err) {
        console.error('Failed to fetch responses:', err);
        setResponses([]);
        setFormCountsByLevel({});
        setFormCountsByDepartment({});
        setFormCountsByDesignation({});
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [selectedLevels, selectedDepartments, selectedDesignations]);

  const handleCheckboxChange = (setter, selected) => (e) => {
    const id = e.target.name;
    setter(
      e.target.checked ? [...selected, id] : selected.filter((x) => x !== id)
    );
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await formService.deleteResponse(id);
      setResponses((prev) => prev.filter((r) => r._id !== id));
      if (selectedResponse?._id === id) setSelectedResponse(null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleOpenDetails = (id) => {
    const found = responses.find((r) => r._id === id);
    setSelectedResponse(found || null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {!selectedResponse ? (
        <>
          <Typography variant="h4" gutterBottom>Submitted Responses</Typography>

          {/* Level Filter */}
          <Typography variant="h6">Select Level</Typography>
          <FormGroup row>
            {levels.map((lvl) => (
              <FormControlLabel
                key={lvl._id}
                control={
                  <Checkbox
                    name={lvl._id}
                    checked={selectedLevels.includes(lvl._id)}
                    onChange={handleCheckboxChange(setSelectedLevels, selectedLevels)}
                  />
                }
                label={`${lvl.name} (${formCountsByLevel[lvl._id] || 0})`}
              />
            ))}
          </FormGroup>

          {/* Department Filter */}
          {filteredDepartments.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>Select Department</Typography>
              <FormGroup row>
                {filteredDepartments.map((dept) => (
                  <FormControlLabel
                    key={dept.dept_id}
                    control={
                      <Checkbox
                        name={dept.dept_id}
                        checked={selectedDepartments.includes(dept.dept_id)}
                        onChange={handleCheckboxChange(setSelectedDepartments, selectedDepartments)}
                      />
                    }
                    label={`${dept.name} (${formCountsByDepartment[dept.dept_id] || 0})`}
                  />
                ))}
              </FormGroup>
            </>
          )}

          {/* Designation Filter */}
          {filteredDesignations.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>Select Designation</Typography>
              <FormGroup row>
                {filteredDesignations.map((desig) => (
                  <FormControlLabel
                    key={desig.desig_id}
                    control={
                      <Checkbox
                        name={desig.desig_id}
                        checked={selectedDesignations.includes(desig.desig_id)}
                        onChange={handleCheckboxChange(setSelectedDesignations, selectedDesignations)}
                      />
                    }
                    label={`${desig.name} (${formCountsByDesignation[desig.desig_id] || 0})`}
                  />
                ))}
              </FormGroup>
            </>
          )}

          {/* Responses List */}
          {responses.length > 0 ? (
            <List sx={{ mt: 3 }}>
              {responses.map((r) => (
                <ListItem
                  key={r._id}
                  onMouseEnter={() => setHoveredResponseId(r._id)}
                  onMouseLeave={() => setHoveredResponseId(null)}
                  sx={{ borderBottom: '1px solid #ccc' }}
                  secondaryAction={
                    <>
                      <Button
                        size="small"
                        onClick={() => handleOpenDetails(r._id)}
                        sx={{
                          visibility: hoveredResponseId === r._id ? 'visible' : 'hidden',
                          mr: 1
                        }}
                      >
                        View
                      </Button>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleDelete(r._id, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={r.formTitle || 'Untitled Form'}
                    secondary={`By: ${r.employeeName || 'Anonymous'} on ${new Date(r.createdAt).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ mt: 2 }}>No responses available.</Typography>
          )}
        </>
      ) : (
        <>
          <Button onClick={() => setSelectedResponse(null)}>Back</Button>
          <Typography variant="h5">{selectedResponse.formTitle || 'Untitled'}</Typography>
          <Typography>Submitted by: {selectedResponse.employeeName || 'Anonymous'}</Typography>
          <Typography sx={{ mb: 2 }}>At: {new Date(selectedResponse.createdAt).toLocaleString()}</Typography>

          {selectedResponse.answers?.map((ans, i) => (
            <Box key={i} sx={{ mb: 2, border: '1px solid #ccc', p: 2 }}>
              <Typography><strong>Question:</strong> {ans.questionText || ans.questionId}</Typography>
              <Typography><strong>Answer:</strong> {String(ans.value)}</Typography>
              {ans.timestamp && (
                <Typography variant="caption" color="text.secondary">
                  Answered at: {new Date(ans.timestamp).toLocaleString()}
                </Typography>
              )}
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default ViewResponses;
