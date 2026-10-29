# Plastic Connect

A full-stack marketplace web application connecting **Plastic Collectors** and **Brands/Buyers** for managing plastic waste listings, comparing suppliers, and processing purchase orders.

## Tech Stack
- **Frontend**: React 18, React Router v6, Axios
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Auth**: JWT (Role-based: Collector & Brand)
- **Storage**: AWS S3 / Local static upload fallback

---

## Project Structure

```
Plastic_connect/
├── START.bat           # One-click Windows startup script
├── START.sh            # Linux/macOS startup script
├── backend/
│   ├── config/         # DB (PostgreSQL pool) and S3 configuration
│   ├── controllers/    # Auth, listings, orders, brands, transactions
│   ├── middleware/     # JWT authentication & role-based access
│   ├── models/         # DB schema & automatic migration
│   ├── routes/         # Express API routes
│   └── server.js       # App entry point
└── frontend/
    └── src/
        ├── api/        # Axios client & API services
        ├── components/ # Navbar, ProtectedRoute
        ├── context/    # AuthContext (Role & Token management)
        └── pages/      # Collector & Brand portal views
```

---

## Quick Start

### One-Click Startup (Windows)
Double-click **`START.bat`** or run:
```cmd
START.bat
```
This automatically boots both the backend on port **5000** and the frontend on port **3000**.

### Manual Startup

#### 1. Backend Setup
```bash
cd backend
npm install
# Ensure .env is populated
npm start
```
*Backend runs on `http://localhost:5000`*

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
*Frontend opens at `http://localhost:3000`*

---

## Portals & Features

### 📦 Collector Portal
- **Dashboard**: Quick navigation for listings and transactions.
- **Add Listing**: Upload plastic waste quantity, price per kg, description, and photos.
- **Active Listings**: View current listings with a **🗑️ Delete** button to retire listings and move them to Previous Listings.
- **Previous Listings**: History of completed and inactive listings.
- **Transactions & Order Requests**:
  - Review incoming purchase order requests submitted by brands.
  - **✓ Accept** or **✕ Reject** incoming order requests.
  - View payment records with an option to delete records or clear history.

### 🏢 Brand Portal
- **Browse Listings**: View active listings with live supplier, pricing, and location details.
- **Supplier Comparison (`/brand/compare`)**: Select 2 or 3 listings to compare side-by-side with automatic **Lowest Price** highlighting.
- **Order Placement**: Request purchase orders with auto-generated unique **5-digit random Order IDs** (10000–99999).
- **My Orders**: Track status (`Pending`, `Accepted`, `Rejected`) of all requested purchase orders.
- **Transaction History**: View confirmed order billing and payment records with individual deletion and clear history options.
- **Company Profile**: Manage business contact information, GST number, and address.

---

## API Reference

### Authentication
| Method | Endpoint           | Auth | Description                          |
|--------|--------------------|------|--------------------------------------|
| POST   | `/api/auth/register` | No   | Register as `collector` or `brand`   |
| POST   | `/api/auth/login`    | No   | Login with email, password, and role |

### Listings
| Method | Endpoint                | Auth | Description                                |
|--------|-------------------------|------|--------------------------------------------|
| POST   | `/api/listings`         | Yes  | Create new listing (with photo upload)     |
| GET    | `/api/listings/active`   | Yes  | Get active listings for current collector  |
| GET    | `/api/listings/previous` | Yes  | Get inactive/completed listings            |
| DELETE | `/api/listings/:id`     | Yes  | Delete active listing (moves to previous)  |

### Orders
| Method | Endpoint                  | Auth | Description                                    |
|--------|---------------------------|------|------------------------------------------------|
| POST   | `/api/orders`             | Yes  | Create order request (generates 5-digit ID)    |
| GET    | `/api/orders/buyer`       | Yes  | Get order history for brand buyer              |
| GET    | `/api/orders/collector`   | Yes  | Get incoming order requests for collector      |
| PUT    | `/api/orders/:id/status`  | Yes  | Accept or reject order (`accepted`/`rejected`) |

### Brands
| Method | Endpoint                    | Auth | Description                               |
|--------|-----------------------------|------|-------------------------------------------|
| GET    | `/api/brands/listings/browse` | Yes  | Browse all active listings from collectors |
| GET    | `/api/brands/profile`         | Yes  | Get brand company profile                 |
| PUT    | `/api/brands/profile`         | Yes  | Update brand contact & billing details    |

### Transactions
| Method | Endpoint               | Auth | Description                               |
|--------|------------------------|------|-------------------------------------------|
| GET    | `/api/transactions`     | Yes  | Get transactions for current user/role    |
| DELETE | `/api/transactions/:id` | Yes  | Delete individual transaction record      |
| DELETE | `/api/transactions`     | Yes  | Clear all transaction history             |

### System
| Method | Endpoint  | Auth | Description      |
|--------|-----------|------|------------------|
| GET    | `/health` | No   | API health check |

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/collector_portal
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

### Frontend `.env`
```env
REACT_APP_API_URL=/api
```

---

## Security & Architecture Highlights
- Passwords hashed with `bcryptjs` (cost factor 12).
- Role-based route protection for both frontend pages and backend API endpoints.
- PostgreSQL database schemas with automatic schema migrations on startup.
- Unique random 5-digit order identification system.
- Cascading relationships between listings, orders, and transactions.
