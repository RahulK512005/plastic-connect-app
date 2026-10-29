const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

const createOrderValidation = [
  body('listing_id').isInt({ gt: 0 }).withMessage('Valid listing_id required'),
  body('quantity_requested').isFloat({ gt: 0 }).withMessage('Quantity must be > 0'),
];

const generateRandomOrderId = async () => {
  for (let attempt = 0; attempt < 20; attempt++) {
    // Generate 5-digit random number between 10000 and 99999
    const randomId = Math.floor(10000 + Math.random() * 90000);
    const existing = await pool.query('SELECT id FROM orders WHERE id = $1', [randomId]);
    if (existing.rows.length === 0) {
      return randomId;
    }
  }
  throw new Error('Unable to generate unique 5-digit order ID');
};

const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { listing_id, quantity_requested } = req.body;
  const buyer_id = req.user.id;

  try {
    // Get listing details
    const listingResult = await pool.query(
      'SELECT * FROM listings WHERE id=$1 AND status=$2',
      [listing_id, 'active']
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or inactive' });
    }

    const listing = listingResult.rows[0];
    const cost_per_unit = listing.cost_per_kg;
    const amount = parseFloat(quantity_requested) * parseFloat(cost_per_unit);

    // Generate unique 5-digit random order ID
    const orderId = await generateRandomOrderId();

    // Create order with status 'pending' - NO payment processing, NO listing status change
    const orderResult = await pool.query(
      `INSERT INTO orders (id, listing_id, buyer_id, status, quantity_requested, amount)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [orderId, listing_id, buyer_id, 'pending', quantity_requested, amount]
    );

    res.status(201).json({
      message: 'Order created successfully',
      order: orderResult.rows[0],
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const collector_id = req.user.id;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "accepted" or "rejected"' });
  }

  try {
    // Verify order exists and collector owns the listing
    const orderResult = await pool.query(
      `SELECT o.*, l.user_id as collector_id FROM orders o
       JOIN listings l ON o.listing_id = l.id
       WHERE o.id=$1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    if (order.collector_id !== collector_id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order can only be accepted or rejected from pending status' });
    }

    // Update order status
    const updatedOrder = await pool.query(
      `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, id]
    );

    // If accepted, also record in transactions table
    if (status === 'accepted') {
      try {
        await pool.query(
          `INSERT INTO transactions (listing_id, amount, order_id, payment_stage)
           VALUES ($1, $2, $3, $4)`,
          [order.listing_id, order.amount, order.id, 'order_accepted']
        );
      } catch (tErr) {
        console.warn('Could not record transaction row:', tErr.message);
      }
    }

    res.json({
      message: `Order ${status} successfully`,
      order: updatedOrder.rows[0],
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCollectorOrders = async (req, res) => {
  const collector_id = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT o.*, l.quantity as listing_quantity, l.cost_per_kg,
              COALESCE(u.name, o.buyer_name) as buyer_name,
              COALESCE(u.email, '') as buyer_email,
              COALESCE(u.phone, o.phone, '') as buyer_phone,
              COALESCE(u.address, o.address, '') as buyer_address
       FROM orders o
       JOIN listings l ON o.listing_id = l.id
       LEFT JOIN users u ON o.buyer_id = u.id
       WHERE l.user_id=$1
       ORDER BY o.created_at DESC`,
      [collector_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getBuyerOrders = async (req, res) => {
  const buyer_id = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT o.*, l.quantity, l.cost_per_kg, COALESCE(u.name, '') as collector_name, COALESCE(u.email, '') as collector_email
       FROM orders o
       JOIN listings l ON o.listing_id = l.id
       LEFT JOIN users u ON l.user_id = u.id
       WHERE o.buyer_id=$1
       ORDER BY o.created_at DESC`,
      [buyer_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getCollectorOrders,
  getBuyerOrders,
  createOrderValidation,
};
