import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { brandsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function BrandProfile() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gst_number: '',
    address: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await brandsApi.getProfile();
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          gst_number: data.gst_number || '',
          address: data.address || '',
          location: data.location || '',
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await brandsApi.updateProfile({
        phone: form.phone || null,
        gst_number: form.gst_number || null,
        address: form.address || null,
        location: form.location || null,
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (loading) return <div className="container"><p>Loading profile...</p></div>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Your Profile 👤</h2>
          <p>Manage your account information</p>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <div className="profile-card">
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" value={form.name} disabled className="input-disabled" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} disabled className="input-disabled" />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              placeholder="Your phone number"
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
            <label>Location</label>
            <input
              type="text"
              placeholder="City/State"
              value={form.location}
              onChange={set('location')}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              placeholder="Your business address"
              value={form.address}
              onChange={set('address')}
              rows="4"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
