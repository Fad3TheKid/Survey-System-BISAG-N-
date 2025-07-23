import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button variant="contained" color="primary" onClick={() => navigate('/admin-dashboard')}>
        Go to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
