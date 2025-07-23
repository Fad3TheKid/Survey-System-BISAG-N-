import React, { useState, useEffect, useContext } from 'react';
import api, { masterDataService } from '../services/api';
import { UserContext } from '../contexts/UserContext';

const EmployeeRegistrationForm = ({ onCancel, onSave }) => {
  const { refreshProfile } = useContext(UserContext);

  const [formData, setFormData] = useState({
    email: '',
    employeeId: '',
    employeeName: '',
    password: '',
    department: '',
    level: '',
    designation: '',
    reportingAuthorityName: '',
    reportingAuthorityDepartment: '',
    reportingAuthorityLevel: '',
    reportingAuthorityDesignation: '',
    dateOfJoining: '',
    confirmValidation: false,
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [showStrengthMeter, setShowStrengthMeter] = useState(false);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 1) strength += 1;
    if (password.length >= 3) strength += 1;
    if (password.length >= 5) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    if (value.length <= 6) {
      setFormData(prev => ({ ...prev, password: value }));
      if (value.length === 6) {
        setShowStrengthMeter(false);
      } else {
        setShowStrengthMeter(true);
        setPasswordStrength(calculatePasswordStrength(value));
      }
    }
  };

  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [filteredReportingAuthorityDesignations, setFilteredReportingAuthorityDesignations] = useState([]);

  const [reportingAuthorityLevels, setReportingAuthorityLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);


  // Handle input changes including checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'department') {
      // Filter designations based on selected department
      const filteredDesigs = designations.filter(
        (desig) => desig.departmentId === value || desig.dept_id === value
      );
      setFilteredDesignations(filteredDesigs);

      // Reset designation when department changes
      setFormData((prev) => ({ ...prev, designation: '' }));
    }

    if (name === 'reportingAuthorityDepartment') {
      // Filter reporting authority designations based on selected department
      const filteredRADesigs = designations.filter(
        (desig) => desig.departmentId === value || desig.dept_id === value
      );
      setFilteredReportingAuthorityDesignations(filteredRADesigs);

      // Reset reporting authority designation when department changes
      setFormData((prev) => ({ ...prev, reportingAuthorityDesignation: '' }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Fetch levels based on selected department
  useEffect(() => {
    const fetchLevels = async () => {
      if (!formData.department) {
        setLevels([]);
        setFormData(prev => ({ ...prev, level: '' }));
        return;
      }

      try {
        const selectedDept = departments.find(
          d => d._id === formData.department || d.dept_id === formData.department
        );

        if (selectedDept) {
          const levelRes = await api.get(`/masterdata/levels/${selectedDept.dept_id}`);
          console.log('Fetched levels:', levelRes);
          setLevels(levelRes.data);

          if (levelRes.data.length === 1) {
            setFormData(prev => {
              console.log('Setting level to:', levelRes.data[0].name);
              return { ...prev, level: levelRes.data[0].name };
            });
          } else {
            setFormData(prev => {
              console.log('Setting level to empty string');
              return { ...prev, level: '' };
            });
          }
        } else {
          setLevels([]);
          setFormData(prev => ({ ...prev, level: '' }));
        }
      } catch (error) {
        console.error('Error fetching levels:', error);
        setLevels([]);
        setFormData(prev => ({ ...prev, level: '' }));
      }
    };

    fetchLevels();
  }, [formData.department, departments]);

  // Fetch reporting authority levels based on their department
  useEffect(() => {
    const fetchReportingAuthorityLevels = async () => {
      if (!formData.reportingAuthorityDepartment) {
        setReportingAuthorityLevels([]);
        setFormData(prev => ({ ...prev, reportingAuthorityLevel: '' }));
        return;
      }

      try {
        const selectedDept = departments.find(
          d => d._id === formData.reportingAuthorityDepartment || d.dept_id === formData.reportingAuthorityDepartment
        );

        if (selectedDept) {
          const levelRes = await api.get(`/masterdata/levels/${selectedDept.dept_id}`);
          setReportingAuthorityLevels(levelRes.data);

          if (levelRes.data.length === 1) {
            setFormData(prev => ({ ...prev, reportingAuthorityLevel: levelRes.data[0].name }));
          } else {
            setFormData(prev => ({ ...prev, reportingAuthorityLevel: '' }));
          }
        } else {
          setReportingAuthorityLevels([]);
          setFormData(prev => ({ ...prev, reportingAuthorityLevel: '' }));
        }
      } catch (error) {
        console.error('Error fetching reporting authority levels:', error);
        setReportingAuthorityLevels([]);
        setFormData(prev => ({ ...prev, reportingAuthorityLevel: '' }));
      }
    };

    fetchReportingAuthorityLevels();
  }, [formData.reportingAuthorityDepartment, departments]);

  // Fetch departments and designations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptRes = await masterDataService.getDepartments();
        setDepartments(deptRes);

        const desigRes = await masterDataService.getDesignations();
        setDesignations(desigRes);
        setFilteredDesignations(desigRes);
        setFilteredReportingAuthorityDesignations(desigRes);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };
    fetchData();
  }, []);

  // Remove previous useEffect for fetching levels based on selected department
  // Remove previous useEffect for fetching reporting authority levels based on their department

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.confirmValidation) {
      alert('Please confirm validation before saving.');
      return;
    }

    try {
      // Prepare loginData and employeeData separately
      const loginData = {
        username: formData.employeeId,
        email: formData.employeeName,
        password: formData.password,
      };
      const employeeData = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        department: formData.department,
        level: formData.level,
        designation: formData.designation,
        reportingAuthorityName: formData.reportingAuthorityName,
        reportingAuthorityDepartment: formData.reportingAuthorityDepartment,
        reportingAuthorityLevel: formData.reportingAuthorityLevel,
        reportingAuthorityDesignation: formData.reportingAuthorityDesignation,
        dateOfJoining: formData.dateOfJoining,
      };

await api.post('/employee/register', formData);
      alert('Employee Registration successfully submitted');
      localStorage.removeItem('isRegistered');
      if (onSave) onSave();
      window.location.href = '/otp-verification';
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + (error.response?.data?.message || error.message || JSON.stringify(error)));
    }
  };

  // Cancel form and reset
  const handleCancel = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      password: '',
      department: '',
      level: '',
      designation: '',
      reportingAuthorityName: '',
      reportingAuthorityDepartment: '',
      reportingAuthorityLevel: '',
      reportingAuthorityDesignation: '',
      dateOfJoining: '',
      confirmValidation: false,
    });
    if (onCancel) onCancel();
  };

  return (
    <div style={{ position: 'relative', maxWidth: 600, margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <button
        aria-label="Close registration form and go to login"
        onClick={() => (window.location.href = '/login')}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'transparent',
          border: 'none',
          fontSize: 24,
          fontWeight: 'bold',
          cursor: 'pointer',
          color: '#333',
          zIndex: 1000,
        }}
      >
        &times;
      </button>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Employee Registration Form</h2>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Employee ID:
          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Employee Name:
          <input
            type="text"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handlePasswordChange}
            maxLength={6}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
          {showStrengthMeter && (
            <div style={{ marginLeft: 10, color: passwordStrength === 'Weak' ? 'red' : passwordStrength === 'Medium' ? 'orange' : 'green', fontWeight: 'bold', alignSelf: 'center' }}>
              {passwordStrength}
            </div>
          )}
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Department:
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">None</option>
            {departments.map((dept) => (
              <option key={dept._id || dept.dept_id} value={dept.dept_id}>
                {dept.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Level:
          <input
            type="text"
            name="level"
            value={formData.level}
            readOnly
            style={{
              padding: 8,
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #ccc',
              backgroundColor: '#f0f0f0',
              cursor: 'not-allowed',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Designation:
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">None</option>
            {filteredDesignations.map((desig) => (
              <option key={desig._id || desig.desig_id} value={desig.name}>
                {desig.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Reporting Authority Name:
          <input
            type="text"
            name="reportingAuthorityName"
            value={formData.reportingAuthorityName}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Reporting Authority Department:
          <select
            name="reportingAuthorityDepartment"
            value={formData.reportingAuthorityDepartment}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">None</option>
            {departments.map((dept) => (
              <option key={dept._id || dept.dept_id} value={dept.dept_id}>
                {dept.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Reporting Authority Level:
          <input
            type="text"
            name="reportingAuthorityLevel"
            value={formData.reportingAuthorityLevel}
            readOnly
            style={{
              padding: 8,
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #ccc',
              backgroundColor: '#f0f0f0',
              cursor: 'not-allowed',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Reporting Authority Designation:
          <select
            name="reportingAuthorityDesignation"
            value={formData.reportingAuthorityDesignation}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          >
            <option value="">None</option>
            {filteredReportingAuthorityDesignations.map((desig) => (
              <option key={desig._id || desig.desig_id} value={desig.name}>
                {desig.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Date of Joining:
          <input
            type="date"
            name="dateOfJoining"
            value={formData.dateOfJoining}
            onChange={handleChange}
            required
            style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
          <input
            type="checkbox"
            name="confirmValidation"
            checked={formData.confirmValidation}
            onChange={handleChange}
            style={{ marginRight: 8 }}
          />
          I've read all the details given above
        </label>

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button
            type="submit"
            disabled={!formData.confirmValidation}
            style={{
              color: formData.confirmValidation ? 'blue' : 'gray',
              backgroundColor: 'transparent',
              border: `2px solid ${formData.confirmValidation ? 'blue' : 'gray'}`,
              padding: '10px 16px',
              borderRadius: 4,
              cursor: formData.confirmValidation ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              outline: 'none',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (formData.confirmValidation) {
                e.currentTarget.style.backgroundColor = 'blue';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'black';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.confirmValidation) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'blue';
                e.currentTarget.style.borderColor = 'blue';
              }
            }}
            onMouseDown={(e) => {
              if (formData.confirmValidation) {
                e.currentTarget.style.transform = 'scale(0.95)';
              }
            }}
            onMouseUp={(e) => {
              if (formData.confirmValidation) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            Save
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={{
              color: 'white',
              backgroundColor: 'transparent',
              border: '2px solid white',
              padding: '10px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              outline: 'none',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = 'black';
              e.currentTarget.style.borderColor = 'black';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'white';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistrationForm;
