import pool from '../config/database.js';

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

		// Dodanie tematu (teraz ze slugiem)
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
