import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { brandsApi, ordersApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await brandsApi.browseListings();
        const found = data.find((l) => l.id === parseInt(id));
        if (!found) setError('Listing not found');
        else setListing(found);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleRequestOrder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter valid quantity');
      return;
    }
    setOrderLoading(true);
    try {
      const amount = parseFloat(quantity) * listing.cost_per_kg;
      const { data } = await ordersApi.createOrder({
        listing_id: listing.id,
        quantity_requested: quantity,
        amount,
      });
      alert('Order created successfully!');
      navigate('/brand/orders');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create order');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container error-msg">{error}</div>;
  if (!listing) return <div className="container"><p>Listing not found</p></div>;

  return (
    <>
      <Navbar />
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          ← Back
        </button>

        <div className="listing-detail">
          {listing.photo_url && (
            <img src={listing.photo_url} alt="listing" className="detail-image" />
          )}

          <div className="detail-content">
            <h2>{listing.collector_name}</h2>
            <p className="subtitle">{listing.location}</p>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Quantity Available</span>
                <span className="value">{listing.quantity} kg</span>
              </div>
              <div className="detail-item">
                <span className="label">Price per kg</span>
                <span className="value">₹{listing.cost_per_kg}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Cost</span>
                <span className="value">₹{listing.total_cost}</span>
              </div>
              <div className="detail-item">
                <span className="label">Collector Email</span>
                <span className="value">{listing.collector_email}</span>
              </div>
            </div>

            {!showOrderForm ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setShowOrderForm(true)}
              >
                Request Order 📋
              </button>
            ) : (
              <div className="order-form">
                <h3>Request Quantity</h3>
                <div className="form-group">
                  <label>Quantity (kg)</label>
                  <input
                    type="number"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    step="0.1"
                    min="0"
                  />
                  <p className="form-note">
                    Estimated cost: ₹{quantity ? (parseFloat(quantity) * listing.cost_per_kg).toFixed(2) : '0'}
                  </p>
                </div>

                <div className="buyer-info">
                  <h4>Your Details</h4>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>GST:</strong> {user.gst_number || 'Not provided'}</p>
                  <p><strong>Address:</strong> {user.address || 'Not provided'}</p>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleRequestOrder}
                    disabled={orderLoading}
                  >
                    {orderLoading ? 'Creating order...' : 'Confirm Order'}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowOrderForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
