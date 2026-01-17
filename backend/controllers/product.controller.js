

const pool = require('../db');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    }catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        const product = rows[0];

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    }catch (error){
        console.error("Error fetching product.", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin - Create a new product
exports.createProduct = async (req, res) => {
    const { name, description, price, stock, requires_prescription } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    // Convert requires_prescription to 0 or 1
    const prescFlag = (requires_prescription === 'yes' || requires_prescription === true || requires_prescription === 1) ? 1 : 0;

    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, stock, requires_prescription) VALUES (?, ?, ?, ?, ?)',
            [name, description || '', price, stock || 0, prescFlag]
        );
        res.status(201).json({ message: 'Product created', productId: result.insertId });
    } catch (error) {
        console.error("Error creating product:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin - Update a product
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, requires_prescription } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    const prescFlag = (requires_prescription === 'yes' || requires_prescription === true || requires_prescription === 1) ? 1 : 0;

    try {
        const [result] = await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, requires_prescription = ? WHERE id = ?',
            [name, description, price, stock, prescFlag, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated' });
    } catch (error) {
        console.error("Error updating product:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


//Admin - Delete a product

exports.deleteProduct = async (req, res) =>{
    const { id } = req.params;

    try{
        const [result] = await pool.query(
            'DELETE FROM products WHERE id = ?',
            [id]
        )
        if (result.affectedRows === 0){
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    }catch (error){
        console.error("Error deleting product:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
}