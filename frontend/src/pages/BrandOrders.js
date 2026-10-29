import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function BrandOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/orders/buyer/' + user.id);
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user.id]);

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'badge-pending',
      accepted: 'badge-accepted',
      rejected: 'badge-rejected',
      completed: 'badge-completed',
    };
    return colors[status] || 'badge-pending';
  };

  if (loading) return <div className="container"><p>Loading orders...</p></div>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Your Orders 📋</h2>
          <p>Track all your purchase orders</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet. Start by browsing listings!</p>
          </div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.collector_name}</td>
                    <td>{o.quantity_requested} kg</td>
                    <td>₹{o.amount}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(o.status)}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
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
