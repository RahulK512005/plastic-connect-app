import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function BrandTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const navigate = useNavigate();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/transactions');
      setTransactions(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this transaction record?`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setSuccessMsg('Transaction record deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete transaction');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all transaction history?')) {
      return;
    }

    try {
      await api.delete('/transactions');
      setTransactions([]);
      setSuccessMsg('All transaction history has been cleared.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clear transaction history');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button className="back-btn" onClick={() => navigate('/brand/dashboard')}>← Back</button>
            <h2>Transaction History 💳</h2>
            <p>View your confirmed orders and payment records</p>
          </div>
          {transactions.length > 0 && (
            <button
              className="btn btn-outline btn-sm"
              style={{ color: '#DC2626', borderColor: '#FECDD3' }}
              onClick={handleClearHistory}
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {successMsg && <div className="alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
        {loading && <div className="spinner">Loading transactions...</div>}
        {error && <div className="error-msg">{error}</div>}

        {!loading && !error && transactions.length === 0 && (
          <div className="empty-state">
            <div className="icon">💳</div>
            <p>No transaction history found. Confirmed orders will appear here.</p>
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.timestamp).toLocaleDateString()}</td>
                    <td><strong>#{t.order_id || t.id}</strong></td>
                    <td>
                      <div>{t.supplier_name || 'Collector'}</div>
                      {t.supplier_email && (
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.supplier_email}</div>
                      )}
                    </td>
                    <td>{t.quantity_requested || t.listing_quantity || '-'} kg</td>
                    <td><strong>₹{t.amount}</strong></td>
                    <td>
                      <span className="badge badge-accepted">
                        {(t.order_status || 'Completed').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-delete-listing"
                        onClick={() => handleDeleteTransaction(t.id)}
                        disabled={actionLoadingId === t.id}
                        title="Delete transaction record"
                      >
                        {actionLoadingId === t.id ? '...' : (
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
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
