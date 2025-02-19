import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, checkEmail } from './controllers/authController.js';
import { verifyToken } from './middleware/auth.js';
import {
	createTopic,
	getCategories,
	getTags,
} from './controllers/topicController.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpointy autoryzacji
app.post('/api/auth/check-email', checkEmail);
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Endpointy dla tematów
app.post('/api/topics', verifyToken, createTopic);
app.get('/api/categories', getCategories);
app.get('/api/tags', getTags);

// Przykład chronionego endpointu
app.get('/api/user/profile', verifyToken, async (req, res) => {
	try {
		const [user] = await pool.query(
			`SELECT u.id, u.username, u.email, u.first_name, u.last_name,
              p.bio, p.location, p.website
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
			[req.userId]
		);

		if (!user) {
			return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
		}

		return res.json(user[0]);
	} catch (error) {
		console.error('Błąd pobierania profilu:', error);
		return res.status(500).json({ error: 'Błąd serwera' });
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Serwer działa na porcie ${PORT}`);
});
