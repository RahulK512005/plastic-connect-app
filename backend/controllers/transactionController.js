const pool = require('../config/db');

const getTransactions = async (req, res) => {
  try {
    const isBrand = req.user?.role === 'brand';
    const query = isBrand
      ? `SELECT t.*, l.quantity as listing_quantity, l.cost_per_kg, l.total_cost,
                o.quantity_requested, COALESCE(o.status, 'completed') as order_status,
                COALESCE(u.name, 'Supplier') as supplier_name,
                COALESCE(u.email, '') as supplier_email
         FROM transactions t
         LEFT JOIN orders o ON t.order_id = o.id
         LEFT JOIN listings l ON t.listing_id = l.id
         LEFT JOIN users u ON l.user_id = u.id
         WHERE o.buyer_id = $1
         ORDER BY t.timestamp DESC`
      : `SELECT t.*, l.quantity, l.cost_per_kg, l.total_cost,
                o.quantity_requested,
                COALESCE(bu.name, o.buyer_name, 'Brand Buyer') as buyer_name,
                COALESCE(bu.email, '') as buyer_email
         FROM transactions t
         LEFT JOIN orders o ON t.order_id = o.id
         LEFT JOIN listings l ON t.listing_id = l.id
         LEFT JOIN users bu ON o.buyer_id = bu.id
         WHERE l.user_id = $1
         ORDER BY t.timestamp DESC`;

    const { rows } = await pool.query(query, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const isBrand = req.user?.role === 'brand';
    const checkQuery = isBrand
      ? `SELECT t.id FROM transactions t
         LEFT JOIN orders o ON t.order_id = o.id
         WHERE t.id = $1 AND o.buyer_id = $2`
      : `SELECT t.id FROM transactions t
         LEFT JOIN listings l ON t.listing_id = l.id
         WHERE t.id = $1 AND l.user_id = $2`;

    const checkRes = await pool.query(checkQuery, [id, req.user.id]);
    if (checkRes.rows.length === 0) {
      // Fallback direct delete
      await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    } else {
      await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const clearTransactions = async (req, res) => {
  try {
    const isBrand = req.user?.role === 'brand';
    if (isBrand) {
      await pool.query(
        `DELETE FROM transactions WHERE id IN (
           SELECT t.id FROM transactions t
           JOIN orders o ON t.order_id = o.id
           WHERE o.buyer_id = $1
         )`,
        [req.user.id]
      );
    } else {
      await pool.query(
        `DELETE FROM transactions WHERE id IN (
           SELECT t.id FROM transactions t
           JOIN listings l ON t.listing_id = l.id
           WHERE l.user_id = $1
         )`,
        [req.user.id]
      );
    }
    res.json({ message: 'Transaction history cleared successfully' });
  } catch (err) {
    console.error('Error clearing transactions:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getTransactions, deleteTransaction, clearTransactions };
