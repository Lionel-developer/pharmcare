

const pool = require('../db');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hash]
        );
        res.status(201).json({ message: 'User registered successfully.' });
    }catch (error) {
        if(error.code === 'ER_DUP_ENTRY'){
            return res.status(400).json({ message: 'Email already in use.' });
        }console.error(error);
        console.error(error.stack, error.message);
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, password, role FROM users WHERE email = ?', [email]
        );

        const user = rows[0];
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

        const isMstch = await bcrypt.compare(password, user.password);
        if (!isMstch) return res.status(400).json({ message: 'Invalid credentials.' });

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }, JWT_SECRET, { expiresIn: '1h' });

        res.json({message: 'Login successful.', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error.' });
    }
};