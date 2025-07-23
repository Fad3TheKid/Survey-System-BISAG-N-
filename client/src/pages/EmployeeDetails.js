import React, { useEffect, useState } from 'react';
import api, { masterDataService, employeeService } from '../services/api';
import * as XLSX from 'xlsx';

const EmployeeDetails = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState('');
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [downloadMode, setDownloadMode] = useState(null);
  const [individualEmployeeId, setIndividualEmployeeId] = useState('');

  // Helper to safely render values, converting objects/arrays to strings
  const safeRender = (value) => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return '[Object]';
    return value;
  };

  // Get department name by id, safely handle objects and arrays
  const getDepartmentName = (deptId) => {
    if (deptId === null || deptId === undefined) return '-';
    if (Array.isArray(deptId)) return deptId.join(', ');
    if (typeof deptId === 'object') return '[Object]';
    const dept = departments.find(d => d.dept_id === deptId || d._id === deptId);
    return dept ? dept.name : deptId;
  };

  // Fetch departments and employees on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptData = await masterDataService.getDepartments();
        setDepartments(deptData);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
      try {
        const empData = await employeeService.getEmployees();
        setEmployees(empData);
      } catch (err) {
        setError('Failed to fetch employee details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle file upload for bulk employee upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      setUploadedData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Upload valid employees after checking duplicates and email validity
  const handleUploadClick = async () => {
    if (!uploadedData || uploadedData.length === 0) {
      alert('No data to upload');
      return;
    }
    const existingEmployeeIds = new Set(employees.map(emp => emp.employeeId));
    const duplicateIds = uploadedData.filter(item => existingEmployeeIds.has(item['Employee ID']));
    if (duplicateIds.length > 0) {
      alert(`Duplicate Employee IDs found: ${duplicateIds.map(d => d['Employee ID']).join(', ')}`);
      return;
    }
    const uploadedEmails = uploadedData
      .map(item => item['Employee Email'])
      .filter(email => email)
      .map(email => email.trim().toLowerCase());
    try {
      const response = await api.post('/employee/check-emails', { emails: uploadedEmails });
      const existingEmails = (response.data.existingEmails || []).map(email => email.toLowerCase());
      const validEmployees = uploadedData.filter(item => existingEmails.includes(item['Employee Email'].trim().toLowerCase()));
      const invalidEmployees = uploadedData.filter(item => !existingEmails.includes(item['Employee Email'].trim().toLowerCase()));
      if (invalidEmployees.length > 0) {
        const invalidEmployeeIds = invalidEmployees.map(item => item['Employee ID']);
        alert(`The following Employee IDs have emails not found in user database: ${invalidEmployeeIds.join(', ')}`);
      }
      if (validEmployees.length === 0) {
        alert('No valid employees to upload.');
        return;
      }
      const transformedData = validEmployees.map(item => ({
        employeeId: item['Employee ID'] || '',
        employeeName: item['Employee Name'] || '',
        email: item['Employee Email'] || '',
        department: item['Department'] || '',
        level: item['Level'] || '',
        designation: item['Designation'] || '',
        reportingAuthorityName: item['Reporting Authority Name'] || '',
        reportingAuthorityDepartment: item['Reporting Authority Department'] || '',
        reportingAuthorityLevel: item['Reporting Authority Level'] || '',
        reportingAuthorityDesignation: item['Reporting Authority Designation'] || '',
        dateOfJoining: item['Date of Joining'] ? new Date(item['Date of Joining']).toISOString() : '',
      }));
      const savedEmployees = await employeeService.createEmployees(transformedData);
      if (savedEmployees && savedEmployees.savedEmployees && savedEmployees.savedEmployees.length > 0) {
        setEmployees(prev => [...prev, ...savedEmployees.savedEmployees]);
      }
      setUploadedData(null);
    } catch (err) {
      alert(`Failed to validate or upload employees: ${err}`);
    }
  };

  // Download all employees as Excel
  const downloadAll = () => {
    const dataForExcel = employees.map(emp => ({
      'Employee ID': safeRender(emp.employeeId),
      'Employee Name': safeRender(emp.employeeName),
      'Employee Email': safeRender(emp.email),
      'Department': safeRender(getDepartmentName(emp.department)),
      'Level': safeRender(emp.level),
      'Designation': safeRender(emp.designation),
      'Reporting Authority Name': safeRender(emp.reportingAuthorityName),
      'Reporting Authority Department': safeRender(getDepartmentName(emp.reportingAuthorityDepartment)),
      'Reporting Authority Level': safeRender(emp.reportingAuthorityLevel),
      'Reporting Authority Designation': safeRender(emp.reportingAuthorityDesignation),
      'Date of Joining': emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'EmployeeDetails_All.xlsx');
  };

  // Download individual employee as Excel
  const downloadIndividual = () => {
    const emp = employees.find(e => e.employeeId === individualEmployeeId);
    if (!emp) {
      alert('Employee ID not found');
      return;
    }
    const dataForExcel = [{
      'Employee ID': safeRender(emp.employeeId),
      'Employee Name': safeRender(emp.employeeName),
      'Employee Email': safeRender(emp.email),
      'Department': safeRender(getDepartmentName(emp.department)),
      'Level': safeRender(emp.level),
      'Designation': safeRender(emp.designation),
      'Reporting Authority Name': safeRender(emp.reportingAuthorityName),
      'Reporting Authority Department': safeRender(getDepartmentName(emp.reportingAuthorityDepartment)),
      'Reporting Authority Level': safeRender(emp.reportingAuthorityLevel),
      'Reporting Authority Designation': safeRender(emp.reportingAuthorityDesignation),
      'Date of Joining': emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-',
    }];
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee');
    XLSX.writeFile(workbook, `EmployeeDetails_${individualEmployeeId}.xlsx`);
    setIndividualEmployeeId('');
  };

  // Delete employee by ID
  const handleDelete = async () => {
    if (!deleteEmployeeId) {
      alert('Please enter an Employee ID to delete');
      return;
    }
    try {
      await employeeService.deleteEmployee(deleteEmployeeId);
      setEmployees(prev => prev.filter(emp => emp.employeeId !== deleteEmployeeId));
      setDeleteEmployeeId('');
      setShowDeleteInput(false);
    } catch (err) {
      alert(`Failed to delete employee: ${err}`);
    }
  };

  if (loading) {
    return <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>Loading employee details...</div>;
  }

  if (error) {
    return <div style={{ padding: 20, fontFamily: 'Arial, sans-serif', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: '95vw', margin: '20px auto', backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif', padding: 20, overflowX: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 10, color: '#03045e', borderBottom: '3px solid #03045e', paddingBottom: 10 }}>Employee Details</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: 25, gap: 15 }}>
        <button
          onClick={downloadAll}
          style={{
            backgroundColor: 'transparent',
            color: '#03045e',
            border: '1px solid #03045e',
            borderRadius: 6,
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: '600',
            flexGrow: 1,
            minWidth: 140,
            transition: 'background-color 0.3s, color 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#03045e';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#03045e';
          }}
        >
          Download All
        </button>
        <button
          onClick={() => setDownloadMode('individual')}
          style={{
            backgroundColor: 'transparent',
            color: '#0077b6',
            border: '1px solid #0077b6',
            borderRadius: 6,
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: '600',
            flexGrow: 1,
            minWidth: 160,
            transition: 'background-color 0.3s, color 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#0077b6';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#0077b6';
          }}
        >
          Download Individual
        </button>
        {downloadMode === 'individual' && (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 20, flexGrow: 3, minWidth: 220 }}>
            <input
              type="text"
              placeholder="Enter Employee ID"
              value={individualEmployeeId}
              onChange={(e) => setIndividualEmployeeId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px 0 0 6px',
                border: '1px solid #90e0ef',
                borderRight: 'none',
                flexGrow: 1,
                color: '#03045e',
                fontSize: 16,
              }}
            />
            <button
              onClick={downloadIndividual}
              style={{
                backgroundColor: '#0077b6',
                color: '#caf0f8',
                border: '1px solid #0077b6',
                borderRadius: '0 6px 6px 0',
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
              }}
              title="Download Employee Details"
            >
              &#x25BC;
            </button>
          </div>
        )}
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          style={{
            marginLeft: 20,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #90e0ef',
            cursor: 'pointer',
            flexGrow: 3,
            minWidth: 220,
            backgroundColor: '#caf0f8',
            color: '#03045e',
          }}
        />
        {uploadedData && (
          <button
            onClick={handleUploadClick}
            style={{
              backgroundColor: '#00b4d8',
              color: '#03045e',
              border: 'none',
              borderRadius: 6,
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: '600',
              marginLeft: 15,
              flexGrow: 1,
              minWidth: 120,
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#90e0ef'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00b4d8'}
          >
            Upload
          </button>
        )}
        {!showDeleteInput && (
          <button
            onClick={() => setShowDeleteInput(true)}
            style={{
              backgroundColor: '#c82333',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a71d2a'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c82333'}
          >
            Delete
          </button>
        )}
        {showDeleteInput && (
          <div style={{ marginBottom: 25, display: 'flex', alignItems: 'center', gap: 15 }}>
            <label style={{ fontWeight: '600', fontSize: 16, color: '#03045e' }}>
              Enter Employee ID to Delete:
              <input
                type="text"
                value={deleteEmployeeId}
                onChange={(e) => setDeleteEmployeeId(e.target.value)}
                style={{
                  padding: 8,
                  fontSize: 16,
                  marginLeft: 15,
                  borderRadius: 6,
                  border: '1px solid #90e0ef',
                  width: 240,
                  color: '#03045e',
                }}
              />
            </label>
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#c82333',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a71d2a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#c82333'}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1px', marginBottom: 15 }}>
          <thead>
            <tr style={{ backgroundColor: '#0b3d91' }}>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Employee ID</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Employee Name</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Employee Email</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Department</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Level</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Designation</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Reporting Authority Name</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Reporting Authority Department</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Reporting Authority Level</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Reporting Authority Designation</th>
              <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Date of Joining</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} style={{ borderBottom: '1px solid #bbdefb', backgroundColor: '#e8eaf6' }}>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.employeeId)}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.employeeName)}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.email)}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(getDepartmentName(emp.department))}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.level)}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.designation)}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.reportingAuthorityName)}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(getDepartmentName(emp.reportingAuthorityDepartment))}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.reportingAuthorityLevel)}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.reportingAuthorityDesignation)}</td>
                <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{safeRender(emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDetails;
