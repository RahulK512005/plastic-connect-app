import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

function ListingCard({ listing, isActive, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete Listing #${listing.id}? It will be moved to Previous Listings.`)) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(listing.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete listing');
      setDeleting(false);
    }
  };

  return (
    <div className="card">
      <div className="listing-card">
        {listing.photo_url ? (
          <img src={listing.photo_url} alt="listing" className="listing-img" />
        ) : (
          <div className="listing-img-placeholder">♻️</div>
        )}
        <div className="listing-info" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>Listing #{listing.id}</h4>
            {isActive && (
              <button
                className="btn-delete-listing"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete listing"
                aria-label="Delete listing"
              >
                {deleting ? (
                  <span className="spinner-dots">...</span>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <div className="listing-meta">
            <span>⚖️ {listing.quantity} kg</span>
            <span>💵 ₹{listing.cost_per_kg}/kg</span>
            <span>💰 Total: ₹{listing.total_cost}</span>
            <span>📅 {new Date(listing.created_at).toLocaleDateString()}</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span className={`badge badge-${listing.status}`}>{listing.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage({ type }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const isActive = type === 'active';

  useEffect(() => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    api.get(`/listings/${type}`)
      .then(({ data }) => setListings(data))
      .catch(() => setError('Failed to load listings'))
      .finally(() => setLoading(false));
  }, [type]);

  const handleDeleteListing = async (id) => {
    await api.delete(`/listings/${id}`);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setSuccessMsg(`Listing #${id} has been moved to Previous Listings.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/collector/dashboard')}>← Back</button>
          <h2>{isActive ? '📦 Active Listings' : '✅ Previous Listings'}</h2>
          <p>{isActive ? 'Your currently active plastic listings' : 'Completed listings history'}</p>
        </div>

        {successMsg && <div className="alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
        {loading && <div className="spinner">Loading...</div>}
        {error && <div className="error-msg">{error}</div>}
        {!loading && !error && listings.length === 0 && (
          <div className="empty-state">
            <div className="icon">{isActive ? '📭' : '🗂️'}</div>
            <p>No {type} listings found.</p>
          </div>
        )}
        {listings.map((l) => (
          <ListingCard
            key={l.id}
            listing={l}
            isActive={isActive}
            onDelete={handleDeleteListing}
          />
        ))}
      </div>
    </>
  );
}
