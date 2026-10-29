const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('role').optional().isIn(['collector', 'brand']).withMessage('Invalid role'),
  body('phone').optional().trim(),
  body('gst_number').optional().trim(),
  body('address').optional().trim(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('role').notEmpty().isIn(['collector', 'brand']).withMessage('Role is required'),
];

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, location, role, phone, gst_number, address } = req.body;
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    const userRole = role || 'collector';
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, location, role, password_hash, phone, gst_number, address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, name, email, role, phone, gst_number, address`,
      [name, email, location || null, userRole, password_hash, phone || null, gst_number || null, address || null]
    );
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, role } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate role match
    if (role && user.role !== role) {
      return res.status(403).json({ error: `Invalid role for this account. This is a ${user.role} account.` });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gst_number: user.gst_number,
        address: user.address,
        location: user.location,
      },
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, registerValidation, loginValidation };
