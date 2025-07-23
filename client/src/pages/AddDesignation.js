import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddDesignation = () => {
  const { deptId } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [levels, setLevels] = useState([]);
  const [newDesignationId, setNewDesignationId] = useState('');
  const [newDesignationName, setNewDesignationName] = useState('');
  const [newLevelId, setNewLevelId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all departments and find the one matching deptId
        const deptRes = await axios.get('/api/masterdata/departments');
        const dept = deptRes.data.find(d => d.dept_id === deptId);
        setDepartment(dept);

        // Fetch levels
        const levelsRes = await axios.get('/api/masterdata/levels');
        setLevels(levelsRes.data);

        // Fetch designations for this department
        const desigRes = await axios.get(`/api/masterdata/designations?department=${deptId}`);
        console.log('Designations fetched:', desigRes.data);
        setDesignations(desigRes.data);

        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };
    fetchData();
  }, [deptId]);

  const handleAddDesignation = async () => {
    if (!newDesignationId || !newDesignationName || !newLevelId) {
      alert('Please enter designation ID, name and select level');
      return;
    }
    try {
      await axios.post('/api/masterdata/designations', {
        desig_id: newDesignationId,
        name: newDesignationName,
        department: deptId,
        level: newLevelId,
      });
      setNewDesignationId('');
      setNewDesignationName('');
      setNewLevelId('');
      // Refresh designations list
      const desigRes = await axios.get(`/api/masterdata/designations?department=${deptId}`);
      setDesignations(desigRes.data);
    } catch (err) {
      alert('Failed to add designation');
    }
  };

  const handleDeleteDesignation = async (desigId) => {
    if (!window.confirm('Are you sure you want to delete this designation?')) return;
    try {
      await axios.delete(`/api/masterdata/designations/${desigId}`);
      setDesignations(designations.filter(d => d._id !== desigId));
    } catch (err) {
      alert('Failed to delete designation');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 30, fontFamily: 'Arial, sans-serif', maxWidth: '95vw', margin: '20px auto', backgroundColor: '#e3f2fd', color: '#1a237e', borderRadius: 12, boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)' }}>
      <h2 style={{ marginBottom: 30, borderBottom: '3px solid #1a237e', paddingBottom: 10, color: '#000000', fontWeight: 'bold', textAlign: 'center' }}>Designations for Department: {department?.name}</h2>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>Back to Departments</button>

      <div style={{ padding: 30, fontFamily: 'Arial, sans-serif', maxWidth: '95vw', margin: '20px auto', backgroundColor: '#ffffff', color: '#1a237e', borderRadius: 12, boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)', marginBottom: 20, display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="New Designation ID"
          value={newDesignationId}
          onChange={e => setNewDesignationId(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #555', backgroundColor: 'white', color: '#666' }}
        />
        <input
          type="text"
          placeholder="New Designation Name"
          value={newDesignationName}
          onChange={e => setNewDesignationName(e.target.value)}
          style={{ flex: 2, padding: 8, borderRadius: 8, border: '1px solid #555', backgroundColor: 'white', color: '#666' }}
        />
        <select
          value={newLevelId}
          onChange={e => setNewLevelId(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #555', backgroundColor: 'white', color: '#666' }}
        >
          <option value="">Select Level</option>
          {levels.map(level => (
            <option key={level._id} value={level._id}>{level.name}</option>
          ))}
        </select>
        <button onClick={handleAddDesignation} style={{ backgroundColor: '#5cb85c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Add</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1px' }}>
        <thead>
          <tr style={{ backgroundColor: '#0b3d91', color: 'white' }}>
            <th style={{ padding: 10, border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Designation ID</th>
            <th style={{ padding: 10, border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Designation Name</th>
            <th style={{ padding: 10, border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Level</th>
            <th style={{ padding: 10, border: '1px solid #0b3d91', color: 'white' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {designations.map((desig, index) => (
            <tr key={desig._id || index} style={{ borderBottom: '1px solid #bbdefb', backgroundColor: '#e8eaf6' }}>
              <td style={{ padding: 10, border: '1px solid #bbdefb', color: '#1a237e' }}>{desig.desig_id || ''}</td>
              <td style={{ padding: 10, border: '1px solid #bbdefb', color: '#1a237e' }}>{desig.name}</td>
              <td style={{ padding: 10, border: '1px solid #bbdefb', color: '#1a237e' }}>{desig.level?.name || ''}</td>
              <td style={{ padding: 10, border: '1px solid #bbdefb', color: '#1a237e' }}>
                <button
                  onClick={() => handleDeleteDesignation(desig._id)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#b71c1c',
                    border: '1px solid #b71c1c',
                    padding: '6px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#b71c1c';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.boxShadow = '0 0 8px #b71c1c';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#b71c1c';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {designations.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: 10, textAlign: 'center', color: '#1a237e' }}>No designations found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AddDesignation;
