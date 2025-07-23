import React, { useState, useRef, useEffect } from 'react';

import { authService } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [bgPositionY, setBgPositionY] = useState('0px');
  const formRef = useRef(null);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setAnimate(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.user.role);
      const isRegistered = response.user.isRegistered;
      if (response.user.role === 'admin') {
        window.location.replace('/admin-dashboard');
      } else {
        if (isRegistered) {
          window.location.replace('/employee-dashboard');
        } else {
          window.location.replace('/employee-registration');
        }
      }
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageContainer: {
      fontFamily: "'Nunito', sans-serif",
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      width: '100vw',
      position: 'relative',
      backgroundColor: 'transparent',
    },
    background: {
      backgroundImage: "url('/background_new.jpeg')",
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
      zIndex: -1,
    },
    scrollDownSection: {
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      zIndex: 1002,
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    scrollText: {
      fontWeight: 700,
      fontSize: 18,
      color: '#ffffff',
      marginBottom: 0,
      padding: '4px 8px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '4px 4px 0 0',
      display: 'block',
    },
    scrollArrow: {
      fontSize: 32,
      color: '#ffffff',
      cursor: 'default',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '0 0 4px 4px',
      padding: '4px 8px',
      display: 'block',
      marginTop: 0,
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
    },
    formContainer: {
      // styles moved inline for animation control
    },
    title: {
      marginBottom: 24,
      fontWeight: 700,
      fontSize: 28,
      color: '#333',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: 8,
      fontWeight: 600,
      color: '#555',
    },
    input: {
      padding: 12,
      marginBottom: 20,
      borderRadius: 6,
      border: '1px solid #ddd',
      fontSize: 16,
      outline: 'none',
      transition: 'border-color 0.3s ease',
    },
    button: {
      padding: 14,
      backgroundColor: '#4a90e2',
      color: '#fff',
      fontWeight: 700,
      fontSize: 16,
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    registerButton: {
      marginTop: 10,
      padding: 14,
      backgroundColor: '#6c757d',
      color: '#fff',
      fontWeight: 700,
      fontSize: 16,
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    error: {
      color: '#e74c3c',
      marginBottom: 16,
      textAlign: 'center',
    },
  };

  return (
    <>
      <div style={{ ...styles.background, backgroundPositionY: bgPositionY, zIndex: -10 }} />
      <div style={{ ...styles.pageContainer, backgroundColor: 'transparent', overflow: 'hidden', height: '100vh' }}>
      <div
        ref={formRef}
        style={{
          ...styles.formContainer,
          transform: 'scale(1)',
          opacity: 1,
          transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
          transformOrigin: 'center center',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transformStyle: 'preserve-3d',
          zIndex: 1001,
          marginTop: 0,
          padding: 40,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
          backgroundColor: '#fff',
          width: 400,
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transform: 'translate(-50%, -50%) scale(1)',
        }}
      >
        <button
          onClick={() => window.location.href = '/'}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: 1100,
          }}
          aria-label="Close"
        >
          &#x2715;
        </button>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {error && <p style={styles.error}>{error}</p>}
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your email"
            autoComplete="email"
          />
          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          <button
            type="button"
            style={styles.registerButton}
            onClick={() => {
              window.location.href = '/register';
            }}
          >
            Register Now
          </button>
        </form>
      </div>
      </div>
    </>
  );
};

export default Login;
