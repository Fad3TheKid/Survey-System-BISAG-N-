import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!otp) {
        setError('OTP is required');
        setLoading(false);
        return;
      }
      if (!email) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      await authService.verifyOtp({ email, otp });
      alert('OTP verified successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <h2 style={styles.title}>OTP Verification</h2>
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
        />
        <label htmlFor="otp" style={styles.label}>OTP</label>
        <input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          style={styles.input}
          placeholder="Enter OTP"
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  pageContainer: {
    fontFamily: "'Nunito', sans-serif",
    maxWidth: 400,
    margin: '100px auto',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
    backgroundColor: '#fff',
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

export default OtpVerification;
