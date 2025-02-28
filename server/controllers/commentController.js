import pool from '../config/database.js';

export const getTopics = async (req, res) => {
	try {
		// Pobierz tematy z podstawowymi informacjami i licznikami
		const [topics] = await pool.query(`
        SELECT 
          t.*,
          c.name as category_name,
          u.username as author_username,
          COUNT(DISTINCT com.id) as comments_count,
          COUNT(DISTINCT r.id) as reactions_count
        FROM topics t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.created_by = u.id
        LEFT JOIN comments com ON t.id = com.topic_id
        LEFT JOIN reactions r ON com.id = r.comment_id
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `);

		// Dla każdego tematu pobierz jego tagi
		const topicsWithTags = await Promise.all(
			topics.map(async (topic) => {
				const [tags] = await pool.query(
					`
            SELECT t.name 
            FROM tags t
            JOIN topic_tags tt ON t.id = tt.tag_id
            WHERE tt.topic_id = ?
          `,
					[topic.id]
				);

				return {
					...topic,
					tags: tags.map((tag) => tag.name),
				};
			})
		);

		res.json(topicsWithTags);
	} catch (error) {
		console.error('Błąd pobierania tematów:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

export const deleteComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const userId = req.userId;

		// Sprawdź czy użytkownik jest adminem
		const [user] = await pool.query('SELECT role FROM users WHERE id = ?', [
			userId,
		]);

		if (user[0].role !== 'admin') {
			return res.status(403).json({ error: 'Brak uprawnień' });
		}

		// Usuń wszystkie reakcje
		await pool.query('DELETE FROM reactions WHERE comment_id = ?', [commentId]);

		// Usuń komentarz i wszystkie jego odpowiedzi
		await pool.query(
			'DELETE FROM comments WHERE id = ? OR parent_comment_id = ?',
			[commentId, commentId]
		);

		res.json({ message: 'Komentarz został usunięty' });
	} catch (error) {
		console.error('Błąd usuwania komentarza:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

// Pobieranie komentarzy dla tematu
export const getTopicComments = async (req, res) => {
	try {
		const { topicId } = req.params;

		// Pobierz główne wpisy (posty admina)
		const [mainComments] = await pool.query(
			`
    SELECT 
        c.id, c.content, c.created_at,
        u.username as author,
        u.role as author_role,
        COUNT(CASE WHEN r.reaction_type = 'like' THEN 1 END) as likes_count,
        COUNT(CASE WHEN r.reaction_type = 'dislike' THEN 1 END) as dislikes_count
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN reactions r ON c.id = r.comment_id
    WHERE c.topic_id = ? AND c.parent_comment_id IS NULL AND c.is_admin_post = true
    GROUP BY c.id
    ORDER BY c.created_at DESC
`,
			[topicId]
		);

		// Dla każdego głównego komentarza pobierz odpowiedzi
		const commentsWithReplies = await Promise.all(
			mainComments.map(async (comment) => {
				const [replies] = await pool.query(
					`
                    SELECT 
                        c.id, c.content, c.created_at, c.reply_to,
                        u.username as author,
                        COUNT(CASE WHEN r.reaction_type = 'like' THEN 1 END) as likes_count,
                        COUNT(CASE WHEN r.reaction_type = 'dislike' THEN 1 END) as dislikes_count
                    FROM comments c
                    LEFT JOIN users u ON c.user_id = u.id
                    LEFT JOIN reactions r ON c.id = r.comment_id
                    WHERE c.parent_comment_id = ?
                    GROUP BY c.id
                    ORDER BY c.created_at ASC
                `,
					[comment.id]
				);

				return {
					...comment,
					replies,
				};
			})
		);

		res.json(commentsWithReplies);
	} catch (error) {
		console.error('Błąd pobierania komentarzy:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

// Dodawanie nowego wpisu (tylko admin)
export const addComment = async (req, res) => {
	try {
		const { topicId } = req.params;
		const { content } = req.body;
		const userId = req.userId;

		// Sprawdź czy użytkownik jest adminem
		const [user] = await pool.query('SELECT role FROM users WHERE id = ?', [
			userId,
		]);
		if (user[0].role !== 'admin') {
			return res.status(403).json({ error: 'Brak uprawnień' });
		}

		const [result] = await pool.query(
			`
    INSERT INTO comments (topic_id, user_id, content, is_admin_post)
    VALUES (?, ?, ?, true)
`,
			[topicId, userId, content]
		);

		res.status(201).json({
			message: 'Wpis został dodany',
			commentId: result.insertId,
		});
	} catch (error) {
		console.error('Błąd dodawania wpisu:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

// Dodawanie odpowiedzi do wpisu
export const addReply = async (req, res) => {
	try {
		const { commentId } = req.params;
		const { content, replyTo } = req.body;
		const userId = req.userId;

		const [result] = await pool.query(
			`INSERT INTO comments (parent_comment_id, user_id, content, is_admin_post, reply_to)
             VALUES (?, ?, ?, false, ?)`,
			[commentId, userId, content, replyTo]
		);

		// Pobierz dodaną odpowiedź z danymi użytkownika
		const [newReply] = await pool.query(
			`SELECT c.*, u.username as author, c.reply_to
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.id = ?`,
			[result.insertId]
		);

		res.status(201).json({
			message: 'Odpowiedź została dodana',
			reply: newReply[0],
		});
	} catch (error) {
		console.error('Błąd dodawania odpowiedzi:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

// Dodawanie reakcji
export const addReaction = async (req, res) => {
	try {
		const { commentId } = req.params;
		const { type } = req.body; // 'like' lub 'dislike'
		const userId = req.userId;

		// Sprawdź czy już nie ma reakcji
		const [existingReaction] = await pool.query(
			'SELECT id, reaction_type FROM reactions WHERE user_id = ? AND comment_id = ?',
			[userId, commentId]
		);

		if (existingReaction.length > 0) {
			if (existingReaction[0].reaction_type === type) {
				// Usuń reakcję jeśli taka sama
				await pool.query('DELETE FROM reactions WHERE id = ?', [
					existingReaction[0].id,
				]);
			} else {
				// Zmień typ reakcji
				await pool.query(
					'UPDATE reactions SET reaction_type = ? WHERE id = ?',
					[type, existingReaction[0].id]
				);
			}
		} else {
			// Dodaj nową reakcję
			await pool.query(
				'INSERT INTO reactions (user_id, comment_id, reaction_type) VALUES (?, ?, ?)',
				[userId, commentId, type]
			);
		}

		res.json({ message: 'Reakcja została zaktualizowana' });
	} catch (error) {
		console.error('Błąd dodawania reakcji:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};
