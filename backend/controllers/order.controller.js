const pool = require('../db');
const { getActiveCart } = require('./cart.controller'); // reuse your helper

exports.placeOrder = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await getActiveCart(userId);

        // Get cart items with product info
        const [items] = await pool.query(
            `SELECT ci.id AS cart_item_id, p.id AS product_id, p.name, p.price, p.requires_prescription, ci.quantity
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cart.id]
        );

        if (items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Validate prescriptions for required items
        for (const item of items.filter(i => i.requires_prescription === 1)) {
            const [rows] = await pool.query(
                `SELECT id FROM prescriptions
                 WHERE user_id = ? AND product_id = ? AND status = 'approved'
                 LIMIT 1`,
                [userId, item.product_id]
            );
            if (rows.length === 0) {
                return res.status(400).json({
                    message: 'Approved prescription required',
                    productId: item.product_id,
                    productName: item.name
                });
            }
        }

        // Calculate total
        let total = 0;
        const orderItemsData = items.map(item => {
            const subtotal = parseFloat(item.price) * item.quantity;
            total += subtotal;
            return [
                item.product_id,
                item.name,
                parseFloat(item.price),
                item.quantity,
                subtotal
            ];
        });

        // Insert order
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
            [userId, total.toFixed(2)]
        );
        const orderId = orderResult.insertId;

        // Insert order items
        const orderItemsInsert = orderItemsData.map(i => [
            orderId,
            ...i
        ]);

        await pool.query(
            `INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity, subtotal)
             VALUES ?`,
            [orderItemsInsert]
        );

        // Mark cart as completed
        await pool.query(
            'UPDATE carts SET status = "completed" WHERE id = ?',
            [cart.id]
        );

        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            total: total.toFixed(2)
        });

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};