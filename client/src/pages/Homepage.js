import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      backgroundImage: "url('https://bisag-n.gov.in/images/a/6.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      filter: 'brightness(0.8)',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      textAlign: 'center',
      padding: '0 20px',
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '1rem',
      fontWeight: 'normal',
      marginBottom: '24px',
      textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
    },
    buttonContainer: {
      display: 'flex',
      gap: '20px',
    },
    button: {
      minWidth: '120px',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <div style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '20px 40px', borderRadius: '12px'}}>
        <div style={styles.title}>Welcome to BISAG-N</div>
        <div style={styles.subtitle}>
          Bhaskaracharya National Institute for Space Applications and Geo-informatics
        </div>
        <div style={{...styles.buttonContainer, justifyContent: 'center'}}>
          <Button
            variant="outlined"
            color="primary"
            style={{...styles.button, transition: 'all 0.3s ease', boxShadow: 'none'}}
            onClick={() => navigate('/login')}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#1976d2';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.boxShadow = '0 0 8px #1976d2';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1976d2';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            style={{...styles.button, transition: 'all 0.3s ease', boxShadow: 'none'}}
            onClick={() => navigate('/register')}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#1976d2';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.boxShadow = '0 0 8px #1976d2';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#1976d2';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
