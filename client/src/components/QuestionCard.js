import React, { useState } from 'react';
import {
  Paper,
  TextField,
  IconButton,
  FormControlLabel,
  Checkbox,
  Menu,
  MenuItem,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Switch as MuiSwitch,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  ContentCopy as DuplicateIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  ViewModule as SectionIcon,
  ShortText as ShortTextIcon,
  Subject as SubjectIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  CheckBox as CheckBoxIcon,
  ArrowDropDownCircle as ArrowDropDownCircleIcon,
  CloudUpload as CloudUploadIcon,
  LinearScale as LinearScaleIcon,
  StarBorder as StarBorderIcon,
  GridView as GridViewIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

const questionTypesGrouped = [
  {
    groupName: '',
    types: [
      { value: 'short', label: 'Short answer', icon: <ShortTextIcon fontSize="small" /> },
      { value: 'paragraph', label: 'Paragraph', icon: <SubjectIcon fontSize="small" /> },
    ],
  },
  {
    groupName: '',
    types: [
      { value: 'multiple', label: 'Multiple choice', icon: <RadioButtonCheckedIcon fontSize="small" /> },
      { value: 'checkbox', label: 'Checkboxes', icon: <CheckBoxIcon fontSize="small" /> },
      { value: 'dropdown', label: 'Dropdown', icon: <ArrowDropDownCircleIcon fontSize="small" /> },
      { value: 'file', label: 'File upload', icon: <CloudUploadIcon fontSize="small" /> },
    ],
  },
  {
    groupName: '',
    types: [
      { value: 'linear', label: 'Linear scale', icon: <LinearScaleIcon fontSize="small" /> },
      { value: 'rating', label: 'Rating', icon: <StarBorderIcon fontSize="small" />, isNew: true },
      { value: 'multipleGrid', label: 'Multiple choice grid', icon: <GridViewIcon fontSize="small" /> },
      { value: 'checkboxGrid', label: 'Checkbox grid', icon: <GridViewIcon fontSize="small" /> },
    ],
  },
  {
    groupName: '',
    types: [
      { value: 'date', label: 'Date', icon: <CalendarTodayIcon fontSize="small" /> },
      { value: 'time', label: 'Time', icon: <AccessTimeIcon fontSize="small" /> },
    ],
  },
];

function QuestionCard({ question, index, onUpdate, onDelete, onDuplicate, selected, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTypeChange = (value) => {
    onUpdate({ ...question, type: value });
    handleMenuClose();
  };

  const handleChange = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  const renderOptions = () => {
    if (!['multiple', 'checkbox', 'dropdown'].includes(question.type)) return null;

    const addOption = () => handleChange('options', [...(question.options || []), '']);
    const updateOption = (i, val) => handleChange('options', question.options.map((o, idx) => idx === i ? val : o));
    const deleteOption = (i) => handleChange('options', question.options.filter((_, idx) => idx !== i));

    return (
      <Box sx={{ mt: 2 }}>
        {question.options?.map((option, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ mr: 2 }}>{question.type === 'multiple' ? '○' : '□'}</Typography>
            <TextField
              value={option}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              fullWidth
              size="small"
            />
            <Tooltip title="Delete Option"><IconButton size="small" onClick={() => deleteOption(i)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addOption} size="small" sx={{ mt: 1 }}>Add Option</Button>
      </Box>
    );
  };

  const renderDate = () => {
    if (question.type !== 'date') return null;
    return (
      <TextField
        fullWidth
        type="date"
        label="Select date"
        value={question.dateValue || ''}
        onChange={(e) => handleChange('dateValue', e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
        size="small"
      />
    );
  };

  // New function to render checkbox grid input
  const renderCheckboxGrid = () => {
    const columns = question.settings?.grid?.columns || [];
    const rows = question.settings?.grid?.rows || [];

    const addColumn = () => {
      const newColumns = [...columns, ''];
      const newGrid = { ...question.settings?.grid, columns: newColumns };
      onUpdate({ ...question, settings: { ...question.settings, grid: newGrid } });
    };
    const updateColumn = (i, val) => {
      const newColumns = columns.map((c, idx) => (idx === i ? val : c));
      const newGrid = { ...question.settings?.grid, columns: newColumns };
      onUpdate({ ...question, settings: { ...question.settings, grid: newGrid } });
    };
    const deleteColumn = (i) => {
      const newColumns = columns.filter((_, idx) => idx !== i);
      const newRows = rows.map(row => {
        const newSelected = { ...row.selected };
        delete newSelected[i];
        return { ...row, selected: newSelected };
      });
      const newGrid = { ...question.settings?.grid, columns: newColumns };
      onUpdate({ ...question, settings: { ...question.settings, grid: newGrid }, rows: newRows });
    };

    const addRow = () => {
      const newRows = [...rows, { label: '', selected: {} }];
      const newGrid = { ...question.settings?.grid, rows: newRows };
      onUpdate({ ...question, settings: { ...question.settings, grid: newGrid } });
    };
    const updateRowLabel = (i, val) => {
      const newRows = rows.map((r, idx) => (idx === i ? { ...r, label: val } : r));
      const newGrid = { ...question.settings?.grid, rows: newRows };
      onUpdate({ ...question, settings: { ...question.settings, grid: newGrid } });
    };
    const deleteRow = (i) => {
      const newRows = rows.filter((_, idx) => idx !== i);
      const newGrid = { ...question.settings?.grid, rows: newRows };
      onUpdate({ ...question, settings: { ...question.settings, grid: newGrid } });
    };

    const toggleCheckbox = (rowIndex, colIndex) => {
      // Enforce only one checkbox selected in entire grid
      const newRows = rows.map((row, rIdx) => {
        const newSelected = {};
        if (rIdx === rowIndex) {
          newSelected[colIndex] = !row.selected[colIndex];
        }
        return { ...row, selected: newSelected };
      });
      const newGrid = { ...question.settings?.grid, rows: newRows };
      onUpdate({ ...question, settings: { ...question.settings, grid: newGrid } });
    };

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Columns (Questions)</Typography>
        {columns.map((col, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              value={col}
              onChange={(e) => updateColumn(i, e.target.value)}
              placeholder={`Column ${i + 1}`}
              size="small"
              fullWidth
            />
            <Tooltip title="Delete Column">
              <IconButton size="small" onClick={() => deleteColumn(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addColumn} size="small" sx={{ mb: 2 }}>Add Column</Button>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>Rows (Checkbox Options)</Typography>
        {rows.map((row, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              value={row.label}
              onChange={(e) => updateRowLabel(i, e.target.value)}
              placeholder={`Row ${i + 1}`}
              size="small"
              fullWidth
            />
            <Tooltip title="Delete Row">
              <IconButton size="small" onClick={() => deleteRow(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addRow} size="small" sx={{ mb: 2 }}>Add Row</Button>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>Checkbox Grid Preview</Typography>
        <Table size="small" sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {columns.map((col, i) => (
                <TableCell key={i} align="center">{col || `Column ${i + 1}`}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rIdx) => (
              <TableRow key={rIdx}>
                <TableCell>{row.label || `Row ${rIdx + 1}`}</TableCell>
                {columns.map((_, cIdx) => (
                  <TableCell key={cIdx} align="center">
                    <Checkbox
                      checked={row.selected?.[cIdx] || false}
                      onChange={() => toggleCheckbox(rIdx, cIdx)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  const renderInputByType = () => {
    switch (question.type) {
      case 'short':
        return <TextField fullWidth label="Short answer text" variant="standard" sx={{ mb: 2 }} disabled />;
      case 'paragraph':
        return <TextField fullWidth label="Long answer text" multiline rows={4} variant="standard" sx={{ mb: 2 }} disabled />;
      case 'multiple':
      case 'checkbox':
      case 'dropdown':
        return renderOptions();
      case 'checkboxGrid':
        return renderCheckboxGrid();
      case 'date':
        return renderDate();
      default:
        return null;
    }
  };

  return (
    <Paper
      onClick={() => onSelect && onSelect(question.id)}
      sx={{ p: 3, mb: 3, position: 'relative', maxWidth: 900, mx: 'auto', borderRadius: 4 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <DragIcon sx={{ mr: 2 }} />
        <Typography variant="h5" sx={{ mr: 2 }}>{index + 1}</Typography>
        <Button
          variant="outlined"
          onClick={handleMenuOpen}
          endIcon={<ArrowDropDownCircleIcon />}
        >
          {questionTypesGrouped.flatMap(group => group.types).find(t => t.value === question.type)?.label || 'Select type'}
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          {questionTypesGrouped.flatMap(group => group.types).map((type) => (
            <MenuItem
              key={type.value}
              selected={type.value === question.type}
              onClick={() => handleTypeChange(type.value)}
            >
              <ListItemIcon>{type.icon}</ListItemIcon>
              <ListItemText>{type.label}</ListItemText>
              {type.isNew && <Box component="span" sx={{ ml: 1, bgcolor: '#673ab7', color: 'white', borderRadius: '4px', px: 0.5, fontSize: '0.75rem' }}>New</Box>}
            </MenuItem>
          ))}
        </Menu>
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title="Duplicate Question"><IconButton onClick={onDuplicate}><DuplicateIcon /></IconButton></Tooltip>
          <Tooltip title="Delete Question"><IconButton onClick={onDelete} color="error"><DeleteIcon /></IconButton></Tooltip>
        </Box>
      </Box>
      <TextField
        fullWidth
        label="Question"
        value={question.title}
        onChange={(e) => handleChange('title', e.target.value)}
        sx={{ mb: 2 }}
        variant="standard"
        placeholder="Untitled Question"
      />
      <TextField
        fullWidth
        label="Description"
        value={question.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        sx={{ mb: 3 }}
        multiline
        maxRows={4}
        variant="standard"
        placeholder="No description"
      />

      {renderInputByType()}

      <FormControlLabel
        control={<MuiSwitch checked={question.required} onChange={(e) => handleChange('required', e.target.checked)} />}
        label="Required"
      />
    </Paper>
  );
}

export default QuestionCard;
