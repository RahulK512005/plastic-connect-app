import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { brandsApi } from '../api/services';

export default function BrandCompare() {
  const location = useLocation();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedIds = location.state?.listingIds || [];

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await brandsApi.browseListings();
        if (selectedIds.length > 0) {
          const matched = data.filter((l) => selectedIds.includes(l.id));
          setListings(matched);
        } else {
          // Fallback if accessed directly: take first 2
          setListings(data.slice(0, 3));
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container"><p className="spinner">Loading comparison details...</p></div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container error-msg">{error}</div>
      </>
    );
  }

  if (listings.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('/brand/browse-listings')}>← Back to Listings</button>
            <h2>Compare Listings ⚖️</h2>
          </div>
          <div className="empty-state">
            <div className="icon">⚖️</div>
            <p>No listings selected for comparison.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={() => navigate('/brand/browse-listings')}
            >
              Browse & Select Listings
            </button>
          </div>
        </div>
      </>
    );
  }

  const prices = listings.map((l) => parseFloat(l.cost_per_kg) || 0);
  const minPrice = Math.min(...prices);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button className="back-btn" onClick={() => navigate('/brand/browse-listings')}>
              ← Back to Listings
            </button>
            <h2>Compare Supplier Listings ⚖️</h2>
            <p>Comparing details for {listings.length} selected suppliers</p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/brand/browse-listings')}
          >
            + Change Selection
          </button>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${listings.length}, minmax(280px, 1fr))`,
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {listings.map((l) => {
            const isLowestPrice = parseFloat(l.cost_per_kg) === minPrice;
            return (
              <div
                key={l.id}
                className="card"
                style={{
                  border: isLowestPrice ? '2px solid #16A34A' : '1px solid var(--border)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                }}
              >
                {isLowestPrice && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '16px',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    🌟 Lowest Price
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                    {l.collector_name}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                    Listing #{l.id} {l.location ? `• 📍 ${l.location}` : ''}
                  </span>
                </div>

                {l.photo_url ? (
                  <img
                    src={l.photo_url}
                    alt={l.collector_name}
                    style={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      background: '#F3F4F6',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '160px',
                      borderRadius: '8px',
                      background: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    ♻️
                  </div>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Price per kg:</span>
                    <strong style={{ fontSize: '1.1rem', color: isLowestPrice ? '#16A34A' : '#111827' }}>
                      ₹{l.cost_per_kg} / kg
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Available Quantity:</span>
                    <strong>{l.quantity} kg</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Total Cost:</span>
                    <strong>₹{l.total_cost}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Location:</span>
                    <span>{l.location || 'Not provided'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Collector Email:</span>
                    <span style={{ fontSize: '0.85rem', color: '#374151', wordBreak: 'break-all' }}>
                      {l.collector_email}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/brand/listing/${l.id}`)}
                >
                  Request Order 📋
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
            Side-by-Side Summary
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  {listings.map((l) => (
                    <th key={l.id}>{l.collector_name} (#{l.id})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Price / kg</strong></td>
                  {listings.map((l) => (
                    <td key={l.id}>
                      <span style={{ fontWeight: 700, color: parseFloat(l.cost_per_kg) === minPrice ? '#16A34A' : '#111827' }}>
                        ₹{l.cost_per_kg}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Quantity</strong></td>
                  {listings.map((l) => (
                    <td key={l.id}>{l.quantity} kg</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Total Cost</strong></td>
                  {listings.map((l) => (
                    <td key={l.id}>₹{l.total_cost}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Location</strong></td>
                  {listings.map((l) => (
                    <td key={l.id}>{l.location || '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Action</strong></td>
                  {listings.map((l) => (
                    <td key={l.id}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/brand/listing/${l.id}`)}
                      >
                        Order Now
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

