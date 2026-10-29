import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const cards = [
  { to: '/brand/browse-listings', icon: '📦', title: 'Browse Listings', desc: 'Find plastic suppliers' },
  { to: '/brand/orders', icon: '📋', title: 'My Orders', desc: 'Track your purchase orders' },
  { to: '/brand/profile', icon: '👤', title: 'My Profile', desc: 'Manage your account details' },
  { to: '/brand/transactions', icon: '💳', title: 'Transactions', desc: 'View payment history' },
];

export default function BrandDashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Welcome, {user?.name} 👋</h2>
          <p>Manage your plastic purchases</p>
        </div>
        <div className="dashboard-grid">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="dash-card">
              <div className="dash-card-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
