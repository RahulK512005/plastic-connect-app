const pool = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, gst_number, address, location, role FROM users WHERE id=$1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  const { phone, gst_number, address, location } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET phone=$1, gst_number=$2, address=$3, location=$4
       WHERE id=$5
       RETURNING id, name, email, phone, gst_number, address, location, role`,
      [phone || null, gst_number || null, address || null, location || null, req.user.id]
    );
    res.json({ message: 'Profile updated', user: rows[0] });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const browseListing = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.name as collector_name, u.location, u.email as collector_email
       FROM listings l
       JOIN users u ON l.user_id = u.id
       WHERE l.status='active'
       ORDER BY l.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, browseListing };
