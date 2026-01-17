
const pool = require('../db');

//User - uploads prescription

exports.uploadPrescription = async (req, res) => {
    const userId = req.user.id;
    const { product_id } = req.body;

    if(!req.file){
        return res.status(400).json({message: 'Please upload a prescription file.'});
    }if(!product_id){
        return res.status(400).json({message: 'Product ID is required.'});
    }
    try {
        await pool.query(
            'INSERT INTO prescriptions (user_id, product_id, file_path) VALUES (?, ?, ?)',
            [userId, product_id, req.file.path]
        );
        res.status(201).json({ message: 'Prescription uploaded successfully. Awaiting approval.' });
    }catch (error){
        console.error("Error uploading prescription:", error.message);
        res.status(500).json({ message: 'Server error' });
    }

};

//Admin - Get all prescriptions
exports.getAllPrescriptions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.*, u.email, pr.name AS product_name
            FROM prescriptions p
             JOIN users u ON p.user_id = u.id
             JOIN products pr ON p.product_id = pr.id`
            );
            res.json(rows);
    }catch (error){
        console.error("Error fetching prescriptions:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

//Admin - Update prescription status
exports.updatePrescriptionStatus = async (req, res) =>{
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)){
        return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
    }
    try {
        const [result] = await pool.query(

            'UPDATE prescriptions SET status = ? WHERE id = ?',
            [status, id]
            
        );
        if (result.affectedRows === 0){
            return res.status(404).json({ message: 'Prescription not found.' });

        }
        res.json({message: `Prescription ${status}.`});
    }catch(error){
        console.error("Error updating prescription status:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
};