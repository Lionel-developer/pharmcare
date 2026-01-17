
const isAdmin = (req, res, next) => {
    if(!req.user || req.user.role !== 'admin'){
        return res.status(403).json({ message: 'Admin access is required. You are not an admin.' });
    }
    next();
};

module.exports = isAdmin;