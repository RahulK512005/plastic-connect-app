import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function BrandRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
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
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, role: 'brand' });
      login(data.token, data.user);
      navigate('/brand-dashboard');
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
      <div className="auth-card">
        <h1>Brand Portal</h1>
        <p className="subtitle">Create your brand account</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              placeholder="Your Company"
              value={form.name}
              onChange={set('name')}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={set('password')}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              placeholder="+91 9999999999"
              value={form.phone}
              onChange={set('phone')}
            />
          </div>
          <div className="form-group">
            <label>GST Number</label>
            <input
              type="text"
              placeholder="22ABCDE1234F1Z0"
              value={form.gst_number}
              onChange={set('gst_number')}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              placeholder="Your business address"
              value={form.address}
              onChange={set('address')}
              rows="3"
              style={{ fontFamily: 'inherit' }}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="link-text">
          Already have an account? <Link to="/brand-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
