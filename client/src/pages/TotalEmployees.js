import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, TablePagination, TextField, Button, Box, Typography } from '@mui/material';

const TotalEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState({});
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('employeeName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments first
        const deptResponse = await axios.get('http://localhost:4000/api/masterdata/departments');
        const deptMap = {};
        deptResponse.data.forEach(dept => {
          deptMap[dept.dept_id] = dept.name;
        });
        setDepartments(deptMap);

        // Fetch employees next
        const token = localStorage.getItem('token');
        const empResponse = await axios.get('http://localhost:4000/api/employee/employees', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Map backend fields to frontend expected fields, replace department ID with name using deptMap
        const data = empResponse.data.map(emp => ({
          id: emp.employeeId || '',
          employeeName: emp.employeeName || '',
          department: deptMap[emp.department] || emp.department || '',
          designation: emp.designation || '',
          level: emp.level || '',
          contact: emp.email || '',
        }));
        setEmployees(data);
        setFilteredEmployees(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchText(value);
    const filtered = employees.filter((emp) =>
      emp.employeeName.toLowerCase().includes(value.toLowerCase()) ||
      emp.department.toLowerCase().includes(value.toLowerCase()) ||
      emp.designation.toLowerCase().includes(value.toLowerCase()) ||
      emp.level.toLowerCase().includes(value.toLowerCase()) ||
      emp.contact.toLowerCase().includes(value.toLowerCase()) ||
      emp.id.toString().includes(value)
    );
    setFilteredEmployees(filtered);
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedEmployees = () => {
    return filteredEmployees.slice().sort((a, b) => {
      if (a[orderBy] < b[orderBy]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[orderBy] > b[orderBy]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportToExcel = () => {
    if (filteredEmployees.length === 0) return;

    const data = filteredEmployees.map(({ id, employeeName, department, designation, level, contact }) => ({
      ID: id,
      Name: employeeName,
      Department: department,
      Designation: designation,
      Level: level,
      Contact: contact,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'TotalEmployees.xlsx');
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ minHeight: '100vh', p: 4, backgroundColor: '#ffffff', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
        Total Employees
      </Typography>
      <Box sx={{ height: 2, backgroundColor: '#001f4d', width: '100%', mb: 3, borderRadius: 1 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchText}
          onChange={handleSearch}
          sx={{
            width: 300,
            borderRadius: 1,
            backgroundColor: '#ffffff',
            '& .MuiOutlinedInput-root': {
              borderColor: 'black',
              '& fieldset': {
                borderColor: 'black',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              },
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
              '& input': {
                color: '#000000',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#000000',
              transition: 'color 0.3s, transform 0.3s, top 0.3s',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#1976d2',
            },
          }}
        />
        <Button variant="contained" onClick={exportToExcel} sx={{ ml: 2, height: 40 }}>
          Export to Excel
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#001f4d' }}>
              {['id', 'employeeName', 'department', 'designation', 'level', 'contact'].map((headCell) => (
                <TableCell key={headCell} sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === headCell}
                    direction={orderBy === headCell ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell)}
                  >
                    {headCell === 'employeeName' ? 'Name' : headCell.charAt(0).toUpperCase() + headCell.slice(1)}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEmployees()
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((employee) => (
                <TableRow
                  key={employee.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: '#cce4f7',
                    '&:hover': {
                      backgroundColor: '#4a90e2',
                      color: '#ffffff',
                      '& td': {
                        color: '#ffffff',
                      },
                    },
                  }}
                >
                  <TableCell sx={{ color: '#000000' }}>{employee.id}</TableCell>
                  <TableCell sx={{ color: '#000000' }}>{employee.employeeName}</TableCell>
                  <TableCell sx={{ color: '#000000' }}>{employee.department}</TableCell>
                  <TableCell sx={{ color: '#000000' }}>{employee.designation}</TableCell>
                  <TableCell sx={{ color: '#000000' }}>{employee.level}</TableCell>
                  <TableCell sx={{ color: '#000000' }}>{employee.contact}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredEmployees.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            color: '#000000',
          },
          '& .MuiInputBase-root': {
            color: '#000000',
          },
          '& .MuiIconButton-root': {
            color: '#000000',
          },
          '& .MuiSelect-icon': {
            color: '#000000',
          },
        }}
      />
    </Box>
  );
};

export default TotalEmployees;
