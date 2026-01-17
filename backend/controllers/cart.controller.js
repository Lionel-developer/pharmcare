
const pool = require('../db');
const { get } = require('../routes/prescription.routes');

//Helper function to get or create active cart for a user
const getActiveCart = async (userId) => {
    const [rows] = await pool.query(
        'SELECT * FROM carts WHERE user_id = ? AND status = "active"',
        [userId]
    );

    if (rows.length > 0) return rows[0];

    const [result] = await pool.query(
        'INSERT INTO carts (user_id, status) VALUES (?, "active")',
        [userId]
    );

    return {
        id: result.insertId,
        user_id: userId,
        status: 'active',
    };
};

//Add product to cart
exports.addToCart = async (req, res) => {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if(!product_id || !quantity || quantity <= 0){
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }
    try{
        const cart = await getActiveCart(userId);

        //Check if product already in cart
        const [existing] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cart.id, product_id]
        );
        if(existing.length > 0){
            await pool.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity, existing[0].id]
            );
        }else{
            await pool.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
                [cart.id, product_id, quantity]
            );
        }
        res.status(200).json({ message: 'Product added to cart' });
        }
        catch(error){
            console.error('Error adding to cart:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
};

//remove product from cart
exports.removeFromCart = async (req, res) => {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    try {
        const cart = await getActiveCart(userId);

        const [rows] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cart.id, product_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        const cartItem = rows[0];

        if (cartItem.quantity > quantity) {
            // subtract quantity
            await pool.query(
                'UPDATE cart_items SET quantity = quantity - ? WHERE id = ?',
                [quantity, cartItem.id]
            );
            return res.status(200).json({ message: `Removed ${quantity} item(s) from cart` });
        } else {
            // remove item entirely
            await pool.query(
                'DELETE FROM cart_items WHERE id = ?',
                [cartItem.id]
            );
            return res.status(200).json({ message: 'Product removed from cart' });
        }

    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
    
//Get current cart items
exports.getCart = async (req, res) => {
    const userId = req.user.id;
    try{
        const cart = await getActiveCart(userId);
    const [items] = await pool.query(
        `SELECT ci.id AS cart_item_id, p.id AS product_id, p.name, p.price, p.requires_prescription, ci.quantity
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cart.id]
        );
        let totalQuantity = 0;
        let totalprice = 0;
        items.forEach(item => {
            totalQuantity += item.quantity;
            totalprice += item.quantity * parseFloat(item.price);
        });

        res.status(200).json({
            cartId: cart.id,
            items,
            totalQuantity,
            totalprice: totalprice.toFixed(2)
        });
    }catch(error){
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}




//Checkout
exports.checkout = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await getActiveCart(userId);

        const [items] = await pool.query(
            `SELECT ci.id AS cart_item_id,
                    p.id AS product_id,
                    p.name,
                    p.price,
                    p.requires_prescription,
                    ci.quantity
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cart.id]
        );

        if (items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const prescriptionItems = items.filter(
            item => item.requires_prescription === 1
        );

        for (const item of prescriptionItems) {
            const [rows] = await pool.query(
                `SELECT id
                 FROM prescriptions
                 WHERE user_id = ?
                   AND product_id = ?
                   AND status = 'approved'
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

        let total = 0;
        const itemsWithTotals = items.map(item => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            total += itemTotal;
            return {
                ...item,
                itemTotal: itemTotal.toFixed(2)
            };
        });

        res.status(200).json({
            message: 'Checkout ready',
            cartId: cart.id,
            total: total.toFixed(2),
            items: itemsWithTotals
        });

    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
