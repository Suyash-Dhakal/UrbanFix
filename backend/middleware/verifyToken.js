import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    const token=req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        
        req.userId=decoded.id; // Attach userId to request object cuz we need it in the next middleware
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}