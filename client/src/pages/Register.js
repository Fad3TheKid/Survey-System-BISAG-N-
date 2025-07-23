import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      console.log('Registering with data:', { username, email, password, confirmPassword, role });
      await authService.register({ username, email, password, confirmPassword, role });
      alert('Registration successful! Please verify your email with the OTP sent.');
      // Redirect to OTP verification page with email in state
      navigate('/otp-verification');
    } catch (err) {
      if (err?.message === 'Email already registered') {
        setError('Email Already exist');
      } else {
        setError(err?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ ...styles.background, backgroundPositionY: '0px' }} />
      <div style={{ ...styles.pageContainer, overflow: 'hidden', height: '100vh' }}>
        {true && <div style={styles.overlay} />}
        <div
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
            minHeight: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transform: 'translate(-50%, -50%) scale(1)',
          }}
        >
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1100 }}>
            <button
              aria-label="Close registration form and go to homepage"
              onClick={() => (window.location.href = '/')}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
          </div>
          <h2 style={styles.title}>Register</h2>
          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            {error && <p style={styles.error}>{error}</p>}
            <label htmlFor="username" style={styles.label}>
              Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your name"
            />
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your email"
            />
            <label htmlFor="role" style={styles.label}>
              Role
            </label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Confirm your password"
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

const styles = {
  pageContainer: {
    fontFamily: "'Nunito', sans-serif",
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    width: '100vw',
    position: 'relative',
  },
  background: {
    backgroundImage: "url('https://bisag-n.gov.in/images/a/6.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'scroll',
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
    cursor: 'pointer',
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
  error: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
};

export default Register;