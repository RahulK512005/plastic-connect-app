import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function AddListing() {
  const [form, setForm] = useState({ quantity: '', cost_per_kg: '' });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const quantity = parseFloat(form.quantity) || 0;
  const costPerKg = parseFloat(form.cost_per_kg) || 0;
  const previewTotal = quantity > 0 && costPerKg > 0 ? (quantity * costPerKg).toFixed(2) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('quantity', form.quantity);
      fd.append('cost_per_kg', form.cost_per_kg);
      if (photo) fd.append('photo', photo);

      await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Listing added successfully!');
      setTimeout(() => navigate('/collector/listings/active'), 1500);
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to add listing';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/collector/dashboard')}>← Back</button>
          <h2>Add Listing</h2>
          <p>Submit a new plastic collection entry</p>
        </div>
        <div className="form-card">
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Enter Quantity (kg)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 50"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Cost per Kg (₹)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 12.50"
                value={form.cost_per_kg}
                onChange={(e) => setForm({ ...form, cost_per_kg: e.target.value })}
                required
              />
            </div>
            {previewTotal && (
              <div className="total-preview">
                💰 Estimated Total: ₹{previewTotal}
                <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.5rem', opacity: 0.7 }}>
                  (calculated server-side on submit)
                </span>
              </div>
            )}
            <div className="form-group">
              <label>Upload Photo</label>
              <label className="file-input-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                />
                {photo ? `📎 ${photo.name}` : '📷 Click to upload an image (optional)'}
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
