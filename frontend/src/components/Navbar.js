import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'brand' ? '/brand/dashboard' : '/collector/dashboard';
  const navBrand = user?.role === 'brand' ? '🏢 Brand Portal' : '♻️ Plastic Connect';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={dashboardLink} className="navbar-brand">{navBrand}</Link>
        <div className="navbar-user">
          <span>👤 {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
