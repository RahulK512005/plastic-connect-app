import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Transactions() {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ordersRes, txRes] = await Promise.all([
        api.get('/orders/collector').catch(() => ({ data: [] })),
        api.get('/transactions').catch(() => ({ data: [] })),
      ]);
      setOrders(ordersRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const actionLabel = newStatus === 'accepted' ? 'accept' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionLabel} Order #${orderId}?`)) {
      return;
    }

    setActionLoadingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setFeedback({
        type: 'success',
        message: `Order #${orderId} has been successfully ${newStatus}!`,
      });
      setTimeout(() => setFeedback(null), 4000);
      // Reload transactions in case a transaction record was created
      api.get('/transactions').then(({ data }) => setTransactions(data || [])).catch(() => {});
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || `Failed to ${actionLabel} order`,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'badge-pending',
      accepted: 'badge-accepted',
      rejected: 'badge-rejected',
      completed: 'badge-completed',
    };
    return colors[status] || 'badge-pending';
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setFeedback({ type: 'success', message: 'Payment record deleted successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to delete payment record' });
    }
  };

  const handleClearPaymentHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all payment history?')) return;
    try {
      await api.delete('/transactions');
      setTransactions([]);
      setFeedback({ type: 'success', message: 'All payment history has been cleared.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to clear payment history' });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/collector/dashboard')}>← Back</button>
          <h2>💳 Transactions & Order Requests</h2>
          <p>Review brand order confirmations, accept or reject incoming requests</p>
        </div>

        {feedback && (
          <div className={feedback.type === 'success' ? 'alert-success' : 'error-msg'} style={{ marginBottom: '1rem' }}>
            {feedback.message}
          </div>
        )}

        {loading && <div className="spinner">Loading transactions...</div>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && (
          <>
            {/* Section 1: Brand Order Requests */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
                  📋 Brand Order Requests
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                  {orders.filter((o) => o.status === 'pending').length} pending confirmation
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📬</div>
                  <p>No order confirmation requests from brands yet.</p>
                </div>
              ) : (
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Brand / Buyer</th>
                        <th>Listing</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Decision / Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{o.buyer_name || 'Brand Buyer'}</div>
                            {o.buyer_email && (
                              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{o.buyer_email}</div>
                            )}
                            {o.buyer_phone && (
                              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>📞 {o.buyer_phone}</div>
                            )}
                          </td>
                          <td>Listing #{o.listing_id}</td>
                          <td>{o.quantity_requested} kg</td>
                          <td><strong>₹{o.amount}</strong></td>
                          <td>
                            <span className={`badge ${getStatusBadge(o.status)}`}>
                              {o.status ? o.status.toUpperCase() : 'PENDING'}
                            </span>
                          </td>
                          <td>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td>
                            {o.status === 'pending' ? (
                              <div className="order-actions-cell">
                                <button
                                  className="btn-action-accept"
                                  onClick={() => handleUpdateStatus(o.id, 'accepted')}
                                  disabled={actionLoadingId === o.id}
                                  title="Accept order confirmation"
                                >
                                  {actionLoadingId === o.id ? '...' : '✓ Accept'}
                                </button>
                                <button
                                  className="btn-action-reject"
                                  onClick={() => handleUpdateStatus(o.id, 'rejected')}
                                  disabled={actionLoadingId === o.id}
                                  title="Reject order"
                                >
                                  {actionLoadingId === o.id ? '...' : '✕ Reject'}
                                </button>
                              </div>
                            ) : o.status === 'accepted' ? (
                              <span style={{ color: '#16A34A', fontWeight: 600, fontSize: '0.85rem' }}>
                                ✓ Accepted
                              </span>
                            ) : (
                              <span style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.85rem' }}>
                                ✕ Rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: Payment Transactions (if any) */}
            {transactions.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                    💰 Payment Records
                  </h3>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ color: '#DC2626', borderColor: '#FECDD3' }}
                    onClick={handleClearPaymentHistory}
                  >
                    🗑️ Clear History
                  </button>
                </div>
                <div className="transactions-table">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Order ID</th>
                        <th>Listing ID</th>
                        <th>Stage</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{t.order_id ? `#${t.order_id}` : '-'}</td>
                          <td>#{t.listing_id}</td>
                          <td>
                            <span className="badge badge-accepted">
                              {t.payment_stage || 'Confirmed'}
                            </span>
                          </td>
                          <td><strong>₹{t.amount}</strong></td>
                          <td>{new Date(t.timestamp).toLocaleString()}</td>
                          <td>
                            <button
                              className="btn-delete-listing"
                              onClick={() => handleDeletePayment(t.id)}
                              title="Delete payment record"
                            >
                              <svg
                                width="14"
                                height="14"
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
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
