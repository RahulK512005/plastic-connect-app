import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { brandsApi } from '../api/services';

export default function BrowseListings() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await brandsApi.browseListings();
        setListings(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggleSelect = (id) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s
    );
  };

  const handleCompare = () => {
    if (selected.length < 2) return;
    navigate('/brand/compare', { state: { listingIds: selected } });
  };

  if (loading) return <div className="container"><p className="spinner">Loading listings...</p></div>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Browse Plastic Listings 📦</h2>
            <p>Find suppliers in your region and select up to 3 to compare</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {selected.length > 0 && (
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                {selected.length} selected
              </span>
            )}
            <button
              className="btn btn-primary"
              onClick={handleCompare}
              disabled={selected.length < 2}
              style={{ minWidth: '140px' }}
            >
              ⚖️ Compare ({selected.length})
            </button>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <p>No active listings available at the moment.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((l) => (
              <div key={l.id} className="brand-listing-card">
                <div className="listing-card-header">
                  <h3>{l.collector_name}</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8rem', color: '#6B7280' }}>
                    <span>Compare</span>
                    <input
                      type="checkbox"
                      checked={selected.includes(l.id)}
                      onChange={() => toggleSelect(l.id)}
                      className="select-checkbox"
                    />
                  </label>
                </div>

                {l.photo_url ? (
                  <img src={l.photo_url} alt={l.collector_name} className="brand-listing-img" />
                ) : (
                  <div className="brand-listing-img-placeholder">
                    ♻️
                  </div>
                )}

                <div className="listing-details" style={{ flex: 1 }}>
                  <p><strong>Quantity:</strong> {l.quantity} kg</p>
                  <p><strong>Price:</strong> ₹{l.cost_per_kg}/kg</p>
                  <p><strong>Location:</strong> {l.location || 'Bengaluru'}</p>
                  <p><strong>Total Cost:</strong> ₹{l.total_cost}</p>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/brand/listing/${l.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
