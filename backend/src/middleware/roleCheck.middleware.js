import jwt from 'jsonwebtoken';

export const allowOnly = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            return next();
        }
        return res.status(403).json({ message: `Forbidden: You do not have permission to access this resource.` });
    };
}