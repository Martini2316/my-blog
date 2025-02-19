import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(' ')[1];
		if (!token) {
			return res.status(401).json({ error: 'Brak tokenu autoryzacji' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId;
		next();
	} catch (error) {
		return res.status(401).json({ error: 'Nieprawidłowy token' });
	}
};
