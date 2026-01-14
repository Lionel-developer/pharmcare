
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET){
    console.error("JWT_SECRET is not defined in environment variables.Auth middleware will not work properly.");
    process.exit(1);
}

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }catch (error){
        return res.status(401).json({message: 'Invalid or expired token.'});
    }
};

module.exports = authenticate;