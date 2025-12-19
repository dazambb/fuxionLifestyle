const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fuxion-secret-key-2025-change-in-production';

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.admin_token;
        
        if (!token) {
            return res.redirect('/admin/login');
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('admin_token');
        return res.redirect('/admin/login');
    }
};

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

module.exports = {
    authMiddleware,
    generateToken,
    JWT_SECRET
};
