import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
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
      const { data } = await api.post('/auth/login', { ...form, role });

      // Validate role match
      if (data.user.role !== role) {
        setError(`Invalid role for this account. This is a ${data.user.role} account.`);
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate(role === 'collector' ? '/collector/dashboard' : '/brand/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Plastic Connect</h1>
        <p className="subtitle">Sign in to your account</p>

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
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading || !role}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="link-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
