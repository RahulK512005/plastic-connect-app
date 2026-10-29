const pool = require('../config/db');

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      location VARCHAR(200),
      role VARCHAR(20) DEFAULT 'collector',
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      gst_number VARCHAR(20),
      address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS listings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      quantity NUMERIC(10,2) NOT NULL,
      cost_per_kg NUMERIC(10,2) NOT NULL,
      total_cost NUMERIC(12,2) NOT NULL,
      photo_url TEXT,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
      buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status VARCHAR(20) DEFAULT 'pending',
      quantity_requested NUMERIC(10,2) NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      advance_payment NUMERIC(12,2),
      final_payment NUMERIC(12,2),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
      amount NUMERIC(12,2) NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      payment_stage VARCHAR(50)
    );

    -- Ensure orders table schema migrations for existing installations
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity_requested NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_payment NUMERIC(12,2);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_payment NUMERIC(12,2);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    -- Ensure orders id sequence starts at minimum 5 digits (10000)
    ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 10000;

    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='buyer_name') THEN
        ALTER TABLE orders ALTER COLUMN buyer_name DROP NOT NULL;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='phone') THEN
        ALTER TABLE orders ALTER COLUMN phone DROP NOT NULL;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='address') THEN
        ALTER TABLE orders ALTER COLUMN address DROP NOT NULL;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total_amount') THEN
        ALTER TABLE orders ALTER COLUMN total_amount DROP NOT NULL;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='advance_amount') THEN
        ALTER TABLE orders ALTER COLUMN advance_amount DROP NOT NULL;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='final_amount') THEN
        ALTER TABLE orders ALTER COLUMN final_amount DROP NOT NULL;
      END IF;
    END $$;
  `);
  console.log('Tables created/verified');
};

module.exports = createTables;
