import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, checkEmail } from './controllers/authController.js';
import { verifyToken } from './middleware/auth.js';
import {
	createTopic,
	getCategories,
	getTags,
	getTopics,
	deleteTopic,
	updateTopic,
} from './controllers/topicController.js';
import {
	updateProfile,
	updateAvatar,
	updatePassword,
	getProfile,
} from './controllers/profileController.js';
import {
	getTopicComments,
	addComment,
	addReply,
	addReaction,
	deleteComment,
} from './controllers/commentController.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpointy autoryzacji
app.post('/api/auth/check-email', checkEmail);
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Endpointy dla tematów
app.get('/api/topics', getTopics); // Dodajemy nowy endpoint
app.post('/api/topics', verifyToken, createTopic);
app.get('/api/categories', getCategories);
app.get('/api/tags', getTags);
app.delete('/api/topics/:id', verifyToken, deleteTopic);
app.put('/api/topics/:id', verifyToken, updateTopic);

// Endpointy profilu użytkownika
app.get('/api/user/profile', verifyToken, getProfile);
app.put('/api/user/profile', verifyToken, updateProfile);
app.put('/api/user/avatar', verifyToken, updateAvatar);
app.put('/api/user/password', verifyToken, updatePassword);

// Endpointy dla komentarzy
app.get('/api/topics/:topicId/comments', getTopicComments);
app.post('/api/topics/:topicId/comments', verifyToken, addComment);
app.post('/api/comments/:commentId/replies', verifyToken, addReply);
app.post('/api/comments/:commentId/reaction', verifyToken, addReaction);
app.delete('/api/comments/:commentId', verifyToken, deleteComment);

app.get('/api/user/activity', verifyToken, async (req, res) => {
	try {
		const userId = req.userId;

		// Pobierz ostatnie aktywności użytkownika
		const [activities] = await pool.query(
			`
		(SELECT 
		  'comment' as type,
		  c.content as description,
		  c.created_at as date,
		  p.title as related_title
		FROM comments c
		JOIN posts p ON c.post_id = p.id
		WHERE c.user_id = ?)
		
		UNION
		
		(SELECT 
		  'topic' as type,
		  t.title as description,
		  t.created_at as date,
		  cat.name as related_title
		FROM topics t
		JOIN categories cat ON t.category_id = cat.id
		WHERE t.created_by = ?)
		
		UNION
		
		(SELECT 
		  'reaction' as type,
		  CONCAT('Zareagowałeś na ', CASE 
			WHEN r.post_id IS NOT NULL THEN 'post'
			ELSE 'komentarz'
		  END) as description,
		  r.created_at as date,
		  COALESCE(p.title, c.content) as related_title
		FROM reactions r
		LEFT JOIN posts p ON r.post_id = p.id
		LEFT JOIN comments c ON r.comment_id = c.id
		WHERE r.user_id = ?)
		
		ORDER BY date DESC
		LIMIT 10
	  `,
			[userId, userId, userId]
		);

		// Pobierz statystyki
		const [[stats]] = await pool.query(
			`
		SELECT 
		  (SELECT COUNT(*) FROM topics WHERE created_by = ?) as topics_count,
		  (SELECT COUNT(*) FROM comments WHERE user_id = ?) as comments_count,
		  (SELECT COUNT(*) FROM reactions WHERE user_id = ?) as reactions_count
	  `,
			[userId, userId, userId]
		);

		// Pobierz najczęściej używane tagi
		const [tags] = await pool.query(
			`
		SELECT t.name, COUNT(*) as count
		FROM topic_tags tt
		JOIN tags t ON tt.tag_id = t.id
		JOIN topics top ON tt.topic_id = top.id
		WHERE top.created_by = ?
		GROUP BY t.id
		ORDER BY count DESC
		LIMIT 5
	  `,
			[userId]
		);

		res.json({
			activities,
			stats,
			favorite_tags: tags,
		});
	} catch (error) {
		console.error('Błąd pobierania aktywności:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
});

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
