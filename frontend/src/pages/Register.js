import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    phone: '',
    gst_number: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Enforce role selection
    if (!role) {
      setError('Please select a role (Collector or Brand)');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, role };
      const { data } = await api.post('/auth/register', payload);
      login(data.token, data.user);
      navigate(role === 'collector' ? '/collector/dashboard' : '/brand/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-expanded">
        <h1>Create Account</h1>
        <p className="subtitle">Join Plastic Connect</p>

        <label className="role-label">Select your role</label>
        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-btn ${role === 'collector' ? 'active' : ''}`}
            onClick={() => setRole('collector')}
          >
            🏭 Collector
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'brand' ? 'active' : ''}`}
            onClick={() => setRole('brand')}
          >
            🏢 Brand
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div className="form-group">
            <label>{role === 'collector' ? 'Full Name' : 'Company Name'}</label>
            <input type="text" placeholder={role === 'collector' ? 'John Doe' : 'Your Company'} value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
          </div>

          {/* Collector Fields */}
          {role === 'collector' && (
            <div className="form-group">
              <label>Location</label>
              <input type="text" placeholder="City, State" value={form.location} onChange={set('location')} />
            </div>
          )}

          {/* Brand-Specific Fields */}
          {role === 'brand' && (
            <>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="+91 9999999999" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input type="text" placeholder="22ABCDE1234F1Z0" value={form.gst_number} onChange={set('gst_number')} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea placeholder="Your business address" value={form.address} onChange={set('address')} rows="3" style={{ fontFamily: 'inherit' }} />
              </div>
            </>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading || !role}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="link-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
