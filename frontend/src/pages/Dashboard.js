import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const cards = [
  { to: '/collector/listings/add', icon: '➕', title: 'Add Listing', desc: 'Submit a new plastic collection listing' },
  { to: '/collector/listings/active', icon: '📦', title: 'Active Listings', desc: 'View your current active listings' },
  { to: '/collector/listings/previous', icon: '✅', title: 'Previous Listings', desc: 'Browse completed listings' },
  { to: '/collector/transactions', icon: '💳', title: 'Transaction History', desc: 'View all your transactions' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h2>Welcome back, {user?.name} 👋</h2>
          <p>What would you like to do today?</p>
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
