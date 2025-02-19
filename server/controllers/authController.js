import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const checkEmail = async (req, res) => {
	try {
		const { email } = req.body;
		const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [
			email,
		]);

		return res.json({ exists: rows.length > 0 });
	} catch (error) {
		console.error('Błąd sprawdzania email:', error);
		return res.status(500).json({ error: 'Błąd serwera' });
	}
};

export const register = async (req, res) => {
	try {
		const { username, email, password, firstName, lastName } = req.body;

		// Logowanie danych wejściowych
		console.log('Dane rejestracji:', { username, email, firstName, lastName });

		// Sprawdzenie czy email już istnieje
		const [existingUser] = await pool.query(
			'SELECT id FROM users WHERE email = ? OR username = ?',
			[email, username]
		);

		if (existingUser.length > 0) {
			return res.status(400).json({
				error: 'Użytkownik o podanym emailu lub nazwie już istnieje',
			});
		}

		// Hashowanie hasła
		const hashedPassword = await bcrypt.hash(password, 10);

		// Dodanie użytkownika
		const [result] = await pool.query(
			`INSERT INTO users (username, email, password, first_name, last_name) 
             VALUES (?, ?, ?, ?, ?)`,
			[username, email, hashedPassword, firstName, lastName]
		);

		console.log('Wynik dodania użytkownika:', result);

		// Utworzenie profilu użytkownika
		await pool.query('INSERT INTO user_profiles (user_id) VALUES (?)', [
			result.insertId,
		]);

		const token = jwt.sign(
			{ userId: result.insertId },
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		);

		return res.status(201).json({
			message: 'Użytkownik został zarejestrowany',
			token,
			user: {
				id: result.insertId,
				username,
				email,
				firstName,
				lastName,
			},
		});
	} catch (error) {
		console.error('Błąd rejestracji:', error);
		return res.status(500).json({ error: 'Błąd serwera' });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Pobranie użytkownika
		const [users] = await pool.query(
			`SELECT id, username, email, password, first_name, last_name, role 
			 FROM users WHERE email = ?`,
			[email]
		);

		if (users.length === 0) {
			return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
		}

		const user = users[0];

		// Weryfikacja hasła
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
		}

		// Generowanie tokenu
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
			expiresIn: '24h',
		});

		return res.json({
			token,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				firstName: user.first_name,
				lastName: user.last_name,
				role: user.role, // dodaj to!
			},
		});
	} catch (error) {
		console.error('Błąd logowania:', error);
		return res.status(500).json({ error: 'Błąd serwera' });
	}
};
