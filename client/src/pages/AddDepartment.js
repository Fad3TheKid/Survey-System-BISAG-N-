import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddDepartment = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);

  const [newDepartment, setNewDepartment] = useState({ dept_id: '', name: '', levelCategory: '' });
  const [newLevel, setNewLevel] = useState({ level_id: '', name: '' });

  const fetchData = async () => {
    try {
      const deptRes = await axios.get('/api/masterdata/departments');
      setDepartments(deptRes.data);

      const levelRes = await axios.get('/api/masterdata/levels');
      setLevels(levelRes.data);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeptChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment(prev => ({ ...prev, [name]: value }));
  };

  const handleLevelChange = (e) => {
    const { name, value } = e.target;
    setNewLevel(prev => ({ ...prev, [name]: value }));
  };

  const addDepartment = async () => {
    if (!newDepartment.dept_id || !newDepartment.name || !newDepartment.levelCategory) {
      alert('Please fill all department fields');
      return;
    }
    try {
      await axios.post('/api/masterdata/departments', newDepartment);
      alert('Department added successfully');
      setNewDepartment({ dept_id: '', name: '', levelCategory: '' });
      fetchData();
    } catch (error) {
      alert('Error adding department: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteDepartment = async (dept_id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`/api/masterdata/departments/${dept_id}`);
      alert('Department deleted successfully');
      fetchData();
    } catch (error) {
      alert('Error deleting department: ' + (error.response?.data?.message || error.message));
    }
  };

  const addLevel = async () => {
    if (!newLevel.level_id || !newLevel.name) {
      alert('Please fill all level fields');
      return;
    }
    try {
      await axios.post('/api/masterdata/levels', newLevel);
      alert('Level added successfully');
      setNewLevel({ level_id: '', name: '' });
      fetchData();
    } catch (error) {
      alert('Error adding level: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteLevel = async (level_id) => {
    if (!window.confirm('Are you sure you want to delete this level?')) return;
    try {
      await axios.delete(`/api/masterdata/levels/${level_id}`);
      alert('Level deleted successfully');
      fetchData();
    } catch (error) {
      alert('Error deleting level: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: 'Arial, sans-serif', maxWidth: '95vw', margin: '20px auto', backgroundColor: '#e3f2fd', color: '#1a237e', borderRadius: 12, boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)' }}>
      <h2 style={{ marginBottom: 30, borderBottom: '3px solid #1a237e', paddingBottom: 10, color: '#000000', fontWeight: 'bold', textAlign: 'center' }}>Add Department</h2>

      <div style={{ padding: 30, fontFamily: 'Arial, sans-serif', maxWidth: '95vw', margin: '20px auto', backgroundColor: '#ffffff', color: '#1a237e', borderRadius: 12, boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)' }}>

        <section style={{ marginBottom: 50 }}>
          <h3 style={{ marginBottom: 15, borderBottom: '1px solid #555', paddingBottom: 5 }}>Departments</h3>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1px', marginBottom: 15 }}>
            <thead>
              <tr style={{ backgroundColor: '#0b3d91' }}>
                <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Dept ID</th>
                <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Level Category</th>
                <th style={{ padding: '10px', border: '1px solid #0b3d91', color: 'white' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.dept_id} style={{ borderBottom: '1px solid #bbdefb', backgroundColor: '#e8eaf6' }}>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{dept.dept_id}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{dept.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{dept.levelCategory}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>
                    <button
                      onClick={() => deleteDepartment(dept.dept_id)}
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
                    <button
                      onClick={() => window.location.hash = `/add-designation/${dept.dept_id}`}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#003366',
                        border: '1px solid #003366',
                        padding: '6px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        marginLeft: 8,
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#003366';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.boxShadow = '0 0 8px #003366';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#003366';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Desig.
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ marginBottom: 10 }}>Add New Department</h4>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 12 }}>
            <input
              type="text"
              name="dept_id"
              placeholder="Dept ID"
              value={newDepartment.dept_id}
              onChange={handleDeptChange}
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #555', backgroundColor: 'white', color: '#666' }}
            />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newDepartment.name}
              onChange={handleDeptChange}
              style={{ flex: 2, padding: 8, borderRadius: 8, border: '1px solid #555', backgroundColor: 'white', color: '#666' }}
            />
            <input
              type="text"
              name="levelCategory"
              placeholder="Level Category"
              value={newDepartment.levelCategory}
              onChange={handleDeptChange}
              style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #555', backgroundColor: 'white', color: '#666' }}
            />
            <button
              onClick={addDepartment}
              style={{ backgroundColor: '#5cb85c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
            >
              Add Department
            </button>
          </div>
        </section>

        <section style={{ marginBottom: 50 }}>
          <h3 style={{ marginBottom: 15, borderBottom: '1px solid #555', paddingBottom: 5 }}>Levels</h3>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1px', marginBottom: 15 }}>
            <thead>
              <tr style={{ backgroundColor: '#0b3d91' }}>
                <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Level ID</th>
                <th style={{ padding: '10px', border: '1px solid #0b3d91', backgroundColor: '#0b3d91', color: 'white' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #0b3d91', color: 'white' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {levels.map(level => (
                <tr key={level.level_id} style={{ borderBottom: '1px solid #bbdefb', backgroundColor: '#e8eaf6' }}>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{level.level_id}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>{level.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #bbdefb' }}>
                    <button
                      onClick={() => deleteLevel(level.level_id)}
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
            </tbody>
          </table>

          <h4 style={{ marginBottom: 10 }}>Add New Level</h4>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, backgroundColor: 'white', padding: 15, borderRadius: 12 }}>
            <input
              type="text"
              name="level_id"
              placeholder="Level ID"
              value={newLevel.level_id}
              onChange={handleLevelChange}
              style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #555', backgroundColor: 'white', color: '#666' }}
            />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newLevel.name}
              onChange={handleLevelChange}
              style={{ flex: 2, padding: 8, borderRadius: 4, border: '1px solid #555', backgroundColor: 'white', color: '#666' }}
            />
            <button
              onClick={addLevel}
              style={{ backgroundColor: '#5cb85c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
            >
              Add Level
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AddDepartment;
