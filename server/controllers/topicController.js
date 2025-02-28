import pool from '../config/database.js';

export const deleteTopic = async (req, res) => {
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		const { id } = req.params;

		// Pobierz informacje o temacie przed usunięciem
		const [topic] = await connection.query(
			'SELECT category_id FROM topics WHERE id = ?',
			[id]
		);

		if (topic.length === 0) {
			return res.status(404).json({ error: 'Temat nie został znaleziony' });
		}

		// Usuń powiązania z tagami i zapisz ID tagów do sprawdzenia
		const [topicTags] = await connection.query(
			'SELECT tag_id FROM topic_tags WHERE topic_id = ?',
			[id]
		);
		const tagIds = topicTags.map((tt) => tt.tag_id);

		await connection.query('DELETE FROM topic_tags WHERE topic_id = ?', [id]);

		// Usuń sam temat
		await connection.query('DELETE FROM topics WHERE id = ?', [id]);

		// Sprawdź i usuń nieużywane tagi
		for (const tagId of tagIds) {
			const [tagUsage] = await connection.query(
				'SELECT COUNT(*) as count FROM topic_tags WHERE tag_id = ?',
				[tagId]
			);
			if (tagUsage[0].count === 0) {
				await connection.query('DELETE FROM tags WHERE id = ?', [tagId]);
			}
		}

		// Sprawdź i usuń nieużywaną kategorię
		const [categoryUsage] = await connection.query(
			'SELECT COUNT(*) as count FROM topics WHERE category_id = ?',
			[topic[0].category_id]
		);
		if (categoryUsage[0].count === 0) {
			await connection.query('DELETE FROM categories WHERE id = ?', [
				topic[0].category_id,
			]);
		}

		await connection.commit();
		res.json({ message: 'Temat został usunięty' });
	} catch (error) {
		await connection.rollback();
		console.error('Błąd usuwania tematu:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	} finally {
		connection.release();
	}
};

export const updateTopic = async (req, res) => {
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		const { id } = req.params;
		const { title, description, category, tags } = req.body;

		// Pobierz stare dane tematu
		const [oldTopic] = await connection.query(
			'SELECT category_id FROM topics WHERE id = ?',
			[id]
		);

		if (oldTopic.length === 0) {
			return res.status(404).json({ error: 'Temat nie został znaleziony' });
		}

		// Dodaj lub pobierz kategorię
		const [categoryResult] = await connection.query(
			'INSERT IGNORE INTO categories (name) VALUES (?)',
			[category]
		);
		const [categoryData] = await connection.query(
			'SELECT id FROM categories WHERE name = ?',
			[category]
		);
		const newCategoryId = categoryData[0].id;

		// Aktualizuj temat
		await connection.query(
			'UPDATE topics SET title = ?, description = ?, category_id = ? WHERE id = ?',
			[title, description, newCategoryId, id]
		);

		// Pobierz stare tagi przed usunięciem
		const [oldTopicTags] = await connection.query(
			'SELECT tag_id FROM topic_tags WHERE topic_id = ?',
			[id]
		);
		const oldTagIds = oldTopicTags.map((tt) => tt.tag_id);

		// Usuń stare powiązania tagów
		await connection.query('DELETE FROM topic_tags WHERE topic_id = ?', [id]);

		// Dodaj nowe tagi
		for (const tag of tags) {
			await connection.query('INSERT IGNORE INTO tags (name) VALUES (?)', [
				tag,
			]);
			const [tagData] = await connection.query(
				'SELECT id FROM tags WHERE name = ?',
				[tag]
			);
			const tagId = tagData[0].id;
			await connection.query(
				'INSERT INTO topic_tags (topic_id, tag_id) VALUES (?, ?)',
				[id, tagId]
			);
		}

		// Sprawdź i usuń nieużywane tagi
		for (const tagId of oldTagIds) {
			const [tagUsage] = await connection.query(
				'SELECT COUNT(*) as count FROM topic_tags WHERE tag_id = ?',
				[tagId]
			);
			if (tagUsage[0].count === 0) {
				await connection.query('DELETE FROM tags WHERE id = ?', [tagId]);
			}
		}

		// Sprawdź i usuń starą kategorię jeśli nie jest już używana
		const [categoryUsage] = await connection.query(
			'SELECT COUNT(*) as count FROM topics WHERE category_id = ?',
			[oldTopic[0].category_id]
		);
		if (categoryUsage[0].count === 0) {
			await connection.query('DELETE FROM categories WHERE id = ?', [
				oldTopic[0].category_id,
			]);
		}

		await connection.commit();
		res.json({ message: 'Temat został zaktualizowany' });
	} catch (error) {
		await connection.rollback();
		console.error('Błąd aktualizacji tematu:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	} finally {
		connection.release();
	}
};

// Funkcja do pobierania tematów (bez komentarzy i polubień)
export const getTopics = async (req, res) => {
	try {
		const [topics] = await pool.query(`
		SELECT 
		  t.*,
		  c.name as category_name,
		  u.username as author_username,
		  COUNT(DISTINCT com.id) as comments_count,
		  COUNT(DISTINCT CASE WHEN r.reaction_type = 'like' THEN r.id END) as likes_count,
		  COUNT(DISTINCT CASE WHEN r.reaction_type = 'dislike' THEN r.id END) as dislikes_count
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

export const createTopic = async (req, res) => {
	const connection = await pool.getConnection();
	try {
		console.log('Otrzymane dane:', req.body);
		console.log('ID użytkownika z tokena:', req.userId);

		await connection.beginTransaction();

		const { title, description, category, tags } = req.body;
		const userId = req.userId;

		// Tworzenie sluga z tytułu
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		// Dodanie lub pobranie kategorii
		const [categoryResult] = await connection.query(
			'INSERT IGNORE INTO categories (name) VALUES (?)',
			[category]
		);

		const [categoryData] = await connection.query(
			'SELECT id FROM categories WHERE name = ?',
			[category]
		);

		if (!categoryData || categoryData.length === 0) {
			throw new Error('Nie udało się utworzyć lub znaleźć kategorii');
		}

		const categoryId = categoryData[0].id;

		// Dodanie tematu
		const [topicResult] = await connection.query(
			`INSERT INTO topics (title, description, category_id, created_by, slug) 
       VALUES (?, ?, ?, ?, ?)`,
			[title, description, categoryId, userId, slug]
		);

		const topicId = topicResult.insertId;

		// Dodanie tagów
		for (const tag of tags) {
			await connection.query('INSERT IGNORE INTO tags (name) VALUES (?)', [
				tag,
			]);
			const [tagData] = await connection.query(
				'SELECT id FROM tags WHERE name = ?',
				[tag]
			);
			const tagId = tagData[0].id;

			await connection.query(
				'INSERT INTO topic_tags (topic_id, tag_id) VALUES (?, ?)',
				[topicId, tagId]
			);
		}

		await connection.commit();
		res.status(201).json({
			message: 'Temat został dodany',
			topicId,
			slug,
		});
	} catch (error) {
		await connection.rollback();
		console.error('Szczegóły błędu:', error);
		res.status(500).json({
			error: 'Błąd serwera',
			details: error.message,
		});
	} finally {
		connection.release();
	}
};

export const getCategories = async (req, res) => {
	try {
		const [categories] = await pool.query(
			'SELECT * FROM categories ORDER BY name'
		);
		res.json(categories);
	} catch (error) {
		console.error('Błąd pobierania kategorii:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

export const getTags = async (req, res) => {
	try {
		const [tags] = await pool.query('SELECT * FROM tags ORDER BY name');
		res.json(tags);
	} catch (error) {
		console.error('Błąd pobierania tagów:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};
