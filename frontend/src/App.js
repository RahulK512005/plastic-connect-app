import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Collector Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddListing from './pages/AddListing';
import ListingsPage from './pages/ListingsPage';
import Transactions from './pages/Transactions';

// Brand Pages
import BrandDashboard from './pages/BrandDashboard';
import BrowseListings from './pages/BrowseListings';
import ListingDetail from './pages/ListingDetail';
import BrandOrders from './pages/BrandOrders';
import BrandProfile from './pages/BrandProfile';
import BrandTransactions from './pages/BrandTransactions';
import BrandCompare from './pages/BrandCompare';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Collector Routes */}
          <Route path="/collector/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/collector/listings/add" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
          <Route path="/collector/listings/active" element={<ProtectedRoute><ListingsPage type="active" /></ProtectedRoute>} />
          <Route path="/collector/listings/previous" element={<ProtectedRoute><ListingsPage type="previous" /></ProtectedRoute>} />
          <Route path="/collector/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />

          {/* Brand Routes */}
          <Route path="/brand/dashboard" element={<ProtectedRoute><BrandDashboard /></ProtectedRoute>} />
          <Route path="/brand/browse-listings" element={<ProtectedRoute><BrowseListings /></ProtectedRoute>} />
          <Route path="/brand/listing/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
          <Route path="/brand/orders" element={<ProtectedRoute><BrandOrders /></ProtectedRoute>} />
          <Route path="/brand/profile" element={<ProtectedRoute><BrandProfile /></ProtectedRoute>} />
          <Route path="/brand/transactions" element={<ProtectedRoute><BrandTransactions /></ProtectedRoute>} />
          <Route path="/brand/compare" element={<ProtectedRoute><BrandCompare /></ProtectedRoute>} />
          <Route path="/brand-compare" element={<ProtectedRoute><BrandCompare /></ProtectedRoute>} />

          {/* Legacy routes for backward compatibility */}
          <Route path="/dashboard" element={<Navigate to="/collector/dashboard" replace />} />
          <Route path="/listings/add" element={<Navigate to="/collector/listings/add" replace />} />
          <Route path="/listings/active" element={<Navigate to="/collector/listings/active" replace />} />
          <Route path="/listings/previous" element={<Navigate to="/collector/listings/previous" replace />} />
          <Route path="/transactions" element={<Navigate to="/collector/transactions" replace />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
