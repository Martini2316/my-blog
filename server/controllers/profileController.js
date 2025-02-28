// profileController.js
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

export const updateProfile = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			bio,
			location,
			website,
			discord_handle,
			github_username,
		} = req.body;
		const userId = req.userId;

		// Aktualizacja danych użytkownika
		await pool.query(
			'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
			[firstName, lastName, userId]
		);

		// Sprawdź czy istnieje profil użytkownika
		const [existingProfile] = await pool.query(
			'SELECT id FROM user_profiles WHERE user_id = ?',
			[userId]
		);

		if (existingProfile.length > 0) {
			// Aktualizuj istniejący profil
			await pool.query(
				`UPDATE user_profiles 
                 SET bio = ?, location = ?, website = ?, discord_handle = ?, github_username = ?
                 WHERE user_id = ?`,
				[bio, location, website, discord_handle, github_username, userId]
			);
		} else {
			// Utwórz nowy profil
			await pool.query(
				`INSERT INTO user_profiles (user_id, bio, location, website, discord_handle, github_username)
                 VALUES (?, ?, ?, ?, ?, ?)`,
				[userId, bio, location, website, discord_handle, github_username]
			);
		}

		// Pobierz zaktualizowane dane
		const [user] = await pool.query(
			`SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.avatar_url,
                    p.bio, p.location, p.website, p.discord_handle, p.github_username
             FROM users u
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE u.id = ?`,
			[userId]
		);

		res.json({
			message: 'Profil został zaktualizowany',
			user: user[0],
		});
	} catch (error) {
		console.error('Błąd aktualizacji profilu:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

export const updateAvatar = async (req, res) => {
	try {
		const { avatar_url } = req.body;
		const userId = req.userId;

		await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [
			avatar_url,
			userId,
		]);

		res.json({
			message: 'Avatar został zaktualizowany',
			avatar_url,
		});
	} catch (error) {
		console.error('Błąd aktualizacji avatara:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

export const updatePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.userId;

		// Pobierz aktualne hasło użytkownika
		const [user] = await pool.query('SELECT password FROM users WHERE id = ?', [
			userId,
		]);

		if (user.length === 0) {
			return res
				.status(404)
				.json({ error: 'Użytkownik nie został znaleziony' });
		}

		// Sprawdź czy aktualne hasło jest poprawne
		const validPassword = await bcrypt.compare(
			currentPassword,
			user[0].password
		);
		if (!validPassword) {
			return res.status(400).json({ error: 'Nieprawidłowe aktualne hasło' });
		}

		// Zahashuj i zapisz nowe hasło
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await pool.query('UPDATE users SET password = ? WHERE id = ?', [
			hashedPassword,
			userId,
		]);

		res.json({ message: 'Hasło zostało zmienione' });
	} catch (error) {
		console.error('Błąd zmiany hasła:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};

// Dodaj też endpoint do pobierania danych profilu
export const getProfile = async (req, res) => {
	try {
		const userId = req.userId;

		const [user] = await pool.query(
			`SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.avatar_url,
                    p.bio, p.location, p.website, p.discord_handle, p.github_username
             FROM users u
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE u.id = ?`,
			[userId]
		);

		if (user.length === 0) {
			return res
				.status(404)
				.json({ error: 'Użytkownik nie został znaleziony' });
		}

		res.json(user[0]);
	} catch (error) {
		console.error('Błąd pobierania profilu:', error);
		res.status(500).json({ error: 'Błąd serwera' });
	}
};
