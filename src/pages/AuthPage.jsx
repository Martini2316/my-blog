import React, { useState, useEffect } from 'react';
import {
	Terminal,
	Mail,
	Lock,
	User,
	Github,
	ArrowRight,
	Eye,
	EyeOff,
	Code,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthPage = () => {
	const navigate = useNavigate();
	const [isLogin, setIsLogin] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const [emailExists, setEmailExists] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
		firstName: '',
		lastName: '',
	});

	// Sprawdzanie emaila
	useEffect(() => {
		const checkEmail = async () => {
			if (!isLogin && formData.email && formData.email.includes('@')) {
				try {
					const response = await axios.post(
						'http://localhost:3001/api/auth/check-email',
						{
							email: formData.email,
						}
					);
					setEmailExists(response.data.exists);
				} catch (error) {
					console.error('Błąd sprawdzania email:', error);
				}
			}
		};

		const timeoutId = setTimeout(checkEmail, 500);
		return () => clearTimeout(timeoutId);
	}, [formData.email, isLogin]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Czyszczenie błędów
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: null,
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.email) {
			newErrors.email = 'Email jest wymagany';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Nieprawidłowy format email';
		}

		if (!formData.password) {
			newErrors.password = 'Hasło jest wymagane';
		} else if (formData.password.length < 6) {
			newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
		}

		if (!isLogin) {
			if (!formData.username) {
				newErrors.username = 'Nazwa użytkownika jest wymagana';
			}
			if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = 'Hasła nie są identyczne';
			}
			if (!formData.firstName) {
				newErrors.firstName = 'Imię jest wymagane';
			}
			if (!formData.lastName) {
				newErrors.lastName = 'Nazwisko jest wymagane';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);
		try {
			if (isLogin) {
				console.log('Wysyłanie danych logowania:', {
					email: formData.email,
					password: formData.password,
				});

				const response = await axios.post(
					'http://localhost:3001/api/auth/login',
					{
						email: formData.email,
						password: formData.password,
					}
				);

				console.log('Odpowiedź serwera (logowanie):', response.data);
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('user', JSON.stringify(response.data.user));
				navigate('/');
			} else {
				if (emailExists) {
					setErrors((prev) => ({
						...prev,
						email: 'Ten email jest już zajęty',
					}));
					return;
				}

				console.log('Wysyłanie danych rejestracji:', formData);

				const response = await axios.post(
					'http://localhost:3001/api/auth/register',
					{
						username: formData.username,
						email: formData.email,
						password: formData.password,
						firstName: formData.firstName,
						lastName: formData.lastName,
					}
				);

				console.log('Odpowiedź serwera (rejestracja):', response.data);
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('user', JSON.stringify(response.data.user));
				navigate('/');
			}
		} catch (error) {
			console.error('Błąd:', error.response?.data || error);
			setErrors((prev) => ({
				...prev,
				submit: error.response?.data?.error || 'Wystąpił błąd',
			}));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='h-screen w-screen flex bg-gray-900'>
			{/* Lewa strona - formularz */}
			<div className='w-1/2 h-full flex items-center justify-center p-8 bg-gray-900'>
				<div className='w-full max-w-md'>
					<div className='mb-8 text-center'>
						<div className='flex justify-center mb-4'>
							<Terminal className='h-10 w-10 text-emerald-400' />
						</div>
						<h2 className='text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent'>
							QuantumFlux
						</h2>
						<p className='text-gray-400 mt-2'>
							{isLogin ? 'Zaloguj się do konta' : 'Stwórz nowe konto'}
						</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-6'>
						{!isLogin && (
							<>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
										<User className='h-5 w-5 text-gray-500' />
									</div>
									<input
										type='text'
										name='username'
										value={formData.username}
										onChange={handleChange}
										className='w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
										placeholder='Nazwa użytkownika'
									/>
									{errors.username && (
										<p className='mt-1 text-sm text-red-500'>
											{errors.username}
										</p>
									)}
								</div>

								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
										<User className='h-5 w-5 text-gray-500' />
									</div>
									<input
										type='text'
										name='firstName'
										value={formData.firstName}
										onChange={handleChange}
										className='w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
										placeholder='Imię'
									/>
									{errors.firstName && (
										<p className='mt-1 text-sm text-red-500'>
											{errors.firstName}
										</p>
									)}
								</div>

								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
										<User className='h-5 w-5 text-gray-500' />
									</div>
									<input
										type='text'
										name='lastName'
										value={formData.lastName}
										onChange={handleChange}
										className='w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
										placeholder='Nazwisko'
									/>
									{errors.lastName && (
										<p className='mt-1 text-sm text-red-500'>
											{errors.lastName}
										</p>
									)}
								</div>
							</>
						)}

						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
								<Mail className='h-5 w-5 text-gray-500' />
							</div>
							<input
								type='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
								className='w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
								placeholder='Email'
							/>
							{errors.email && (
								<p className='mt-1 text-sm text-red-500'>{errors.email}</p>
							)}
							{emailExists && !isLogin && (
								<p className='mt-1 text-sm text-red-500'>
									Ten email jest już zajęty
								</p>
							)}
						</div>

						<div className='relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
								<Lock className='h-5 w-5 text-gray-500' />
							</div>
							<input
								type={showPassword ? 'text' : 'password'}
								name='password'
								value={formData.password}
								onChange={handleChange}
								className='w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
								placeholder='Hasło'
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='absolute inset-y-0 right-0 pr-3 flex items-center'>
								{showPassword ? (
									<EyeOff className='h-5 w-5 text-gray-500' />
								) : (
									<Eye className='h-5 w-5 text-gray-500' />
								)}
							</button>
							{errors.password && (
								<p className='mt-1 text-sm text-red-500'>{errors.password}</p>
							)}
						</div>

						{!isLogin && (
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center'>
									<Lock className='h-5 w-5 text-gray-500' />
								</div>
								<input
									type={showPassword ? 'text' : 'password'}
									name='confirmPassword'
									value={formData.confirmPassword}
									onChange={handleChange}
									className='w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
									placeholder='Potwierdź hasło'
								/>
								{errors.confirmPassword && (
									<p className='mt-1 text-sm text-red-500'>
										{errors.confirmPassword}
									</p>
								)}
							</div>
						)}

						{errors.submit && (
							<p className='text-center text-sm text-red-500'>
								{errors.submit}
							</p>
						)}

						<button
							type='submit'
							disabled={isLoading || (!isLogin && emailExists)}
							className='w-full flex justify-center items-center py-2 px-4 bg-emerald-500 hover:bg-emerald-600 rounded-md text-white font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isLoading ? (
								'Przetwarzanie...'
							) : (
								<>
									<ArrowRight className='h-5 w-5 mr-2' />
									{isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
								</>
							)}
						</button>

						<div className='relative my-6'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-700'></div>
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-gray-900 text-gray-400'>
									Lub kontynuuj z
								</span>
							</div>
						</div>

						<button
							type='button'
							className='w-full flex justify-center items-center py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-200 font-medium border border-gray-700 transition-colors duration-200'>
							<Github className='h-5 w-5 mr-2' />
							Github
						</button>

						<div className='text-center mt-6'>
							<button
								type='button'
								onClick={() => {
									setIsLogin(!isLogin);
									setFormData({
										username: '',
										email: '',
										password: '',
										confirmPassword: '',
										firstName: '',
										lastName: '',
									});
									setErrors({});
								}}
								className='text-emerald-400 hover:text-emerald-300 text-sm'>
								{isLogin
									? 'Nie masz konta? Zarejestruj się'
									: 'Masz już konto? Zaloguj się'}
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* Prawa strona - informacje */}
			<div className='w-1/2 h-full bg-gray-900 flex items-center justify-center p-16'>
				<div className='max-w-lg'>
					<h1 className='text-4xl font-bold text-white mb-8'>
						Witaj w społeczności QuantumFlux!
					</h1>

					<div className='space-y-8'>
						<div className='flex items-start space-x-4'>
							<div className='flex-shrink-0 p-2 bg-gray-800 rounded-lg'>
								<Code className='h-6 w-6 text-emerald-400' />
							</div>
							<div>
								<h3 className='text-xl font-semibold text-white mb-2'>
									Blog Developera
								</h3>
								<p className='text-gray-400'>
									Śledź rozwój silnika gier QuantumFlux, poznaj kulisy
									implementacji i bądź częścią społeczności.
								</p>
							</div>
						</div>

						<div className='flex items-start space-x-4'>
							<div className='flex-shrink-0 p-2 bg-gray-800 rounded-lg'>
								<Code className='h-6 w-6 text-blue-400' />
							</div>
							<div>
								<h3 className='text-xl font-semibold text-white mb-2'>
									Otwarte Źródła
								</h3>
								<p className='text-gray-400'>
									Projekt jest w pełni open source. Możesz przeglądać kod,
									zgłaszać problemy i proponować zmiany.
								</p>
							</div>
						</div>

						<div className='flex items-start space-x-4'>
							<div className='flex-shrink-0 p-2 bg-gray-800 rounded-lg'>
								<Code className='h-6 w-6 text-purple-400' />
							</div>
							<div>
								<h3 className='text-xl font-semibold text-white mb-2'>
									Aktywna Społeczność
								</h3>
								<p className='text-gray-400'>
									Dołącz do dyskusji, dziel się swoimi pomysłami i ucz się od
									innych pasjonatów game developmentu.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
