const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

const listingValidation = [
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be > 0'),
  body('cost_per_kg').isFloat({ gt: 0 }).withMessage('Cost per kg must be > 0'),
];

const addListing = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { quantity, cost_per_kg } = req.body;
  const total_cost = parseFloat(quantity) * parseFloat(cost_per_kg);
  const photo_url = req.file
    ? (req.file.location || `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`)
    : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO listings (user_id, quantity, cost_per_kg, total_cost, photo_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, quantity, cost_per_kg, total_cost, photo_url]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

const getActiveListings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.name as collector_name FROM listings l
       JOIN users u ON l.user_id = u.id
       WHERE l.user_id=$1 AND l.status='active' ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

const getPreviousListings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.name as collector_name FROM listings l
       JOIN users u ON l.user_id = u.id
       WHERE l.user_id=$1 AND l.status != 'active' ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteListing = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE listings
       SET status='inactive'
       WHERE id=$1 AND user_id=$2
       RETURNING *`,
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found or unauthorized' });
    }

    res.json({ message: 'Listing moved to previous listings', listing: rows[0] });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { addListing, getActiveListings, getPreviousListings, deleteListing, listingValidation };
