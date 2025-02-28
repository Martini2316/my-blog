import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	User,
	Camera,
	Shield,
	Bell,
	Palette,
	Lock,
	Check,
	X,
	Globe,
	MessageSquare,
	Github,
	Link,
	Settings,
	Moon,
	Code,
	UserCircle,
} from 'lucide-react';
import axios from 'axios';

const SIDEBAR_ITEMS = [
	{ id: 'personal', label: 'Dane osobowe', icon: User },
	{ id: 'avatar', label: 'Avatar', icon: Camera },
	{ id: 'security', label: 'Bezpieczeństwo', icon: Shield },
	{ id: 'social', label: 'Społeczność', icon: Link },
	{ id: 'notifications', label: 'Powiadomienia', icon: Bell },
	{ id: 'appearance', label: 'Wygląd', icon: Palette },
	{ id: 'privacy', label: 'Prywatność', icon: Lock },
	{ id: 'accessibility', label: 'Dostępność', icon: UserCircle },
	{ id: 'activity', label: 'Aktywność', icon: MessageSquare },
];

const AVATARS = [
	'/avatars/avatar1.png',
	'/avatars/avatar2.png',
	'/avatars/avatar3.png',
	'/avatars/avatar4.png',
	'/avatars/avatar5.png',
	'/avatars/avatar6.png',
];

const ProfilePage = () => {
	const navigate = useNavigate();
	const [activeSection, setActiveSection] = useState('personal');
	const [user, setUser] = useState(null);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		bio: '',
		location: '',
		website: '',
		discord_handle: '',
		github_username: '',
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [selectedAvatar, setSelectedAvatar] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			const userData = JSON.parse(storedUser);
			setUser(userData);
			setFormData((prev) => ({
				...prev,
				firstName: userData.firstName || '',
				lastName: userData.lastName || '',
			}));
			setSelectedAvatar(userData.avatar_url || AVATARS[0]);

			// Pobierz dodatkowe dane z profilu
			fetchUserProfile(userData.id);
		}
	}, []);

	const fetchUserProfile = async (userId) => {
		try {
			const response = await axios.get(
				'http://localhost:3001/api/user/profile',
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			setFormData((prev) => ({
				...prev,
				bio: response.data.bio || '',
				location: response.data.location || '',
				website: response.data.website || '',
				discord_handle: response.data.discord_handle || '',
				github_username: response.data.github_username || '',
			}));
		} catch (error) {
			console.error('Błąd pobierania profilu:', error);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleClose = () => {
		navigate('/');
	};

	const handleSavePersonal = async (e) => {
		e.preventDefault();
		try {
			setIsLoading(true);
			const response = await axios.put(
				'http://localhost:3001/api/user/profile',
				{
					firstName: formData.firstName,
					lastName: formData.lastName,
					bio: formData.bio,
					location: formData.location,
					website: formData.website,
					discord_handle: formData.discord_handle,
					github_username: formData.github_username,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			const updatedUser = {
				...user,
				firstName: formData.firstName,
				lastName: formData.lastName,
			};
			localStorage.setItem('user', JSON.stringify(updatedUser));
			setUser(updatedUser);
			setSuccess('Dane zostały zaktualizowane');
		} catch (error) {
			setError('Nie udało się zaktualizować danych');
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();

		if (formData.newPassword !== formData.confirmPassword) {
			setError('Hasła nie są identyczne');
			return;
		}

		if (formData.newPassword.length < 6) {
			setError('Hasło musi mieć co najmniej 6 znaków');
			return;
		}

		try {
			setIsLoading(true);
			const response = await axios.put(
				'http://localhost:3001/api/user/password',
				{
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			setSuccess('Hasło zostało zmienione pomyślnie');
			setFormData((prev) => ({
				...prev,
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			}));
		} catch (error) {
			if (error.response?.status === 400) {
				setError('Aktualne hasło jest nieprawidłowe');
			} else {
				setError('Wystąpił błąd podczas zmiany hasła');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleAvatarSelect = async (avatarUrl) => {
		try {
			setIsLoading(true);
			const response = await axios.put(
				'http://localhost:3001/api/user/avatar',
				{ avatar_url: avatarUrl },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			setSelectedAvatar(avatarUrl);
			const updatedUser = { ...user, avatar_url: avatarUrl };
			localStorage.setItem('user', JSON.stringify(updatedUser));
			setUser(updatedUser);
			setSuccess('Avatar został zaktualizowany');
		} catch (error) {
			setError('Nie udało się zaktualizować avatara');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gray-900 text-gray-100'>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold'>Ustawienia profilu</h1>
					<button
						onClick={handleClose}
						className='p-2 text-gray-400 hover:text-gray-200 transition-colors duration-200'>
						<X className='h-6 w-6' />
					</button>
				</div>

				<div className='flex gap-8'>
					{/* Sidebar */}
					<div className='w-64 flex-shrink-0'>
						<div className='bg-gray-800 rounded-lg p-4'>
							{SIDEBAR_ITEMS.map((item) => {
								const Icon = item.icon;
								return (
									<button
										key={item.id}
										onClick={() => setActiveSection(item.id)}
										className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
											activeSection === item.id
												? 'bg-emerald-500 text-white'
												: 'text-gray-400 hover:bg-gray-700'
										}`}>
										<Icon className='h-5 w-5' />
										<span>{item.label}</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Content */}
					<div className='flex-1'>
						<div className='bg-gray-800 rounded-lg p-6'>
							{/* Success/Error Messages */}
							{success && (
								<div className='flex items-center space-x-2 p-4 mb-4 bg-emerald-500/20 text-emerald-400 rounded-lg'>
									<Check className='h-5 w-5' />
									<span>{success}</span>
									<button onClick={() => setSuccess('')} className='ml-auto'>
										<X className='h-5 w-5' />
									</button>
								</div>
							)}

							{error && (
								<div className='flex items-center space-x-2 p-4 mb-4 bg-red-500/20 text-red-400 rounded-lg'>
									<X className='h-5 w-5' />
									<span>{error}</span>
									<button onClick={() => setError('')} className='ml-auto'>
										<X className='h-5 w-5' />
									</button>
								</div>
							)}

							{/* Personal Data Section */}
							{activeSection === 'personal' && (
								<form onSubmit={handleSavePersonal} className='space-y-6'>
									<h2 className='text-xl font-semibold mb-6'>Dane osobowe</h2>

									<div className='space-y-4'>
										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Email
											</label>
											<input
												type='email'
												value={user?.email || ''}
												disabled
												className='w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed'
											/>
										</div>

										<div className='grid grid-cols-2 gap-4'>
											<div>
												<label className='block text-sm font-medium text-gray-400 mb-1'>
													Imię
												</label>
												<input
													type='text'
													name='firstName'
													value={formData.firstName}
													onChange={handleInputChange}
													className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
												/>
											</div>

											<div>
												<label className='block text-sm font-medium text-gray-400 mb-1'>
													Nazwisko
												</label>
												<input
													type='text'
													name='lastName'
													value={formData.lastName}
													onChange={handleInputChange}
													className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
												/>
											</div>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Bio
											</label>
											<textarea
												name='bio'
												value={formData.bio}
												onChange={handleInputChange}
												rows='4'
												className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
												placeholder='Napisz coś o sobie...'
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Lokalizacja
											</label>
											<div className='relative'>
												<Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500' />
												<input
													type='text'
													name='location'
													value={formData.location}
													onChange={handleInputChange}
													className='w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
													placeholder='np. Warszawa, Polska'
												/>
											</div>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Strona internetowa
											</label>
											<div className='relative'>
												<Link className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500' />
												<input
													type='url'
													name='website'
													value={formData.website}
													onChange={handleInputChange}
													className='w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
													placeholder='https://example.com'
												/>
											</div>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Discord
											</label>
											<div className='relative'>
												<MessageSquare className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500' />
												<input
													type='text'
													name='discord_handle'
													value={formData.discord_handle}
													onChange={handleInputChange}
													className='w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
													placeholder='username#0000'
												/>
											</div>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												GitHub
											</label>
											<div className='relative'>
												<Github className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500' />
												<input
													type='text'
													name='github_username'
													value={formData.github_username}
													onChange={handleInputChange}
													className='w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
													placeholder='username'
												/>
											</div>
										</div>
									</div>

									<button
										type='submit'
										disabled={isLoading}
										className='px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50'>
										{isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
									</button>
								</form>
							)}

							{/* Pozostałe sekcje pozostają takie same */}

							{/* Avatar Section */}
							{activeSection === 'avatar' && (
								<div>
									<h2 className='text-xl font-semibold mb-6'>Wybierz avatar</h2>
									<div className='grid grid-cols-3 gap-4'>
										{AVATARS.map((avatar, index) => (
											<div
												key={index}
												onClick={() => handleAvatarSelect(avatar)}
												className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
													selectedAvatar === avatar
														? 'border-emerald-500'
														: 'border-transparent'
												}`}>
												<img
													src={avatar}
													alt={`Avatar ${index + 1}`}
													className='w-full h-full object-cover'
												/>
												{selectedAvatar === avatar && (
													<div className='absolute inset-0 bg-emerald-500/20 flex items-center justify-center'>
														<Check className='h-8 w-8 text-emerald-500' />
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Security Section */}
							{activeSection === 'security' && (
								<form onSubmit={handleChangePassword} className='space-y-6'>
									<h2 className='text-xl font-semibold mb-6'>Zmiana hasła</h2>

									<div className='space-y-4'>
										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Aktualne hasło
											</label>
											<input
												type='password'
												name='currentPassword'
												value={formData.currentPassword}
												onChange={handleInputChange}
												className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Nowe hasło
											</label>
											<input
												type='password'
												name='newPassword'
												value={formData.newPassword}
												onChange={handleInputChange}
												className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
											/>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Potwierdź nowe hasło
											</label>
											<input
												type='password'
												name='confirmPassword'
												value={formData.confirmPassword}
												onChange={handleInputChange}
												className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
											/>
										</div>
									</div>

									<button
										type='submit'
										disabled={isLoading}
										className='px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50'>
										{isLoading ? 'Zmienianie hasła...' : 'Zmień hasło'}
									</button>
								</form>
							)}

							{/* Social Links Section */}
							{activeSection === 'social' && (
								<div className='space-y-6'>
									<h2 className='text-xl font-semibold mb-6'>
										Linki społecznościowe
									</h2>

									<div className='space-y-4'>
										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												Discord
											</label>
											<div className='relative'>
												<MessageSquare className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500' />
												<input
													type='text'
													name='discord_handle'
													value={formData.discord_handle}
													onChange={handleInputChange}
													className='w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
													placeholder='username#0000'
												/>
											</div>
										</div>

										<div>
											<label className='block text-sm font-medium text-gray-400 mb-1'>
												GitHub
											</label>
											<div className='relative'>
												<Github className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500' />
												<input
													type='text'
													name='github_username'
													value={formData.github_username}
													onChange={handleInputChange}
													className='w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500'
													placeholder='username'
												/>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Notifications Section */}
							{activeSection === 'notifications' && (
								<div className='space-y-6'>
									<h2 className='text-xl font-semibold mb-6'>Powiadomienia</h2>

									<div className='space-y-4'>
										<div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg'>
											<div>
												<h3 className='font-medium text-gray-200'>
													Powiadomienia email
												</h3>
												<p className='text-sm text-gray-400'>
													Otrzymuj powiadomienia na email
												</p>
											</div>
											<label className='relative inline-flex items-center cursor-pointer'>
												<input type='checkbox' className='sr-only peer' />
												<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
											</label>
										</div>

										<div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg'>
											<div>
												<h3 className='font-medium text-gray-200'>
													Powiadomienia na stronie
												</h3>
												<p className='text-sm text-gray-400'>
													Otrzymuj powiadomienia w przeglądarce
												</p>
											</div>
											<label className='relative inline-flex items-center cursor-pointer'>
												<input type='checkbox' className='sr-only peer' />
												<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
											</label>
										</div>
									</div>
								</div>
							)}

							{/* Appearance Section */}
							{activeSection === 'appearance' && (
								<div className='space-y-6'>
									<h2 className='text-xl font-semibold mb-6'>Wygląd</h2>

									<div className='space-y-4'>
										<div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg'>
											<div>
												<h3 className='font-medium text-gray-200'>
													Tryb ciemny
												</h3>
												<p className='text-sm text-gray-400'>
													Przełącz między jasnym a ciemnym motywem
												</p>
											</div>
											<label className='relative inline-flex items-center cursor-pointer'>
												<input
													type='checkbox'
													className='sr-only peer'
													defaultChecked
												/>
												<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
											</label>
										</div>
									</div>
								</div>
							)}

							{/* Privacy Section */}
							{activeSection === 'privacy' && (
								<div className='space-y-6'>
									<h2 className='text-xl font-semibold mb-6'>Prywatność</h2>

									<div className='space-y-4'>
										<div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg'>
											<div>
												<h3 className='font-medium text-gray-200'>
													Profil publiczny
												</h3>
												<p className='text-sm text-gray-400'>
													Pozwól innym zobaczyć twój profil
												</p>
											</div>
											<label className='relative inline-flex items-center cursor-pointer'>
												<input type='checkbox' className='sr-only peer' />
												<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
											</label>
										</div>

										<div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg'>
											<div>
												<h3 className='font-medium text-gray-200'>
													Pokazuj status online
												</h3>
												<p className='text-sm text-gray-400'>
													Pokaż innym kiedy jesteś aktywny
												</p>
											</div>
											<label className='relative inline-flex items-center cursor-pointer'>
												<input type='checkbox' className='sr-only peer' />
												<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
											</label>
										</div>
									</div>
								</div>
							)}

							{/* Accessibility Section */}
							{activeSection === 'accessibility' && (
								<div className='space-y-6'>
									<h2 className='text-xl font-semibold mb-6'>Dostępność</h2>

									<div className='space-y-4'>
										<div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg'>
											<div>
												<h3 className='font-medium text-gray-200'>
													Większy kontrast
												</h3>
												<p className='text-sm text-gray-400'>
													Zwiększ kontrast interfejsu
												</p>
											</div>
											<label className='relative inline-flex items-center cursor-pointer'>
												<input type='checkbox' className='sr-only peer' />
												<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
											</label>
										</div>

										<div className='flex items-center justify-between p-4 bg-gray-700 rounded-lg'>
											<div>
												<h3 className='font-medium text-gray-200'>
													Zmniejsz animacje
												</h3>
												<p className='text-sm text-gray-400'>
													Ogranicz efekty animacji
												</p>
											</div>
											<label className='relative inline-flex items-center cursor-pointer'>
												<input type='checkbox' className='sr-only peer' />
												<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
											</label>
										</div>
									</div>
								</div>
							)}

							{activeSection === 'activity' && (
								<div className='space-y-6'>
									<h2 className='text-xl font-semibold mb-6'>Aktywność</h2>

									<div className='space-y-4'>
										<div className='p-4 bg-gray-700 rounded-lg'>
											<h3 className='font-medium text-gray-200 mb-4'>
												Ostatnia aktywność
											</h3>

											<div className='space-y-4'>
												<div className='flex items-start space-x-4'>
													<div className='w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0'>
														<MessageSquare className='h-5 w-5 text-emerald-500' />
													</div>
													<div>
														<p className='text-gray-200'>
															Skomentowałeś temat "Implementacja fizyki w
															silniku"
														</p>
														<p className='text-sm text-gray-400'>
															2 godziny temu
														</p>
													</div>
												</div>

												<div className='flex items-start space-x-4'>
													<div className='w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0'>
														<Settings className='h-5 w-5 text-blue-500' />
													</div>
													<div>
														<p className='text-gray-200'>
															Zaktualizowałeś swój profil
														</p>
														<p className='text-sm text-gray-400'>wczoraj</p>
													</div>
												</div>

												<div className='flex items-start space-x-4'>
													<div className='w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0'>
														<Code className='h-5 w-5 text-purple-500' />
													</div>
													<div>
														<p className='text-gray-200'>
															Utworzyłeś nowy temat "Optymalizacja renderowania"
														</p>
														<p className='text-sm text-gray-400'>2 dni temu</p>
													</div>
												</div>
											</div>
										</div>

										<div className='grid grid-cols-3 gap-4'>
											<div className='p-4 bg-gray-700 rounded-lg'>
												<h4 className='text-sm font-medium text-gray-400 mb-2'>
													Tematy
												</h4>
												<p className='text-2xl font-bold text-gray-200'>12</p>
											</div>

											<div className='p-4 bg-gray-700 rounded-lg'>
												<h4 className='text-sm font-medium text-gray-400 mb-2'>
													Komentarze
												</h4>
												<p className='text-2xl font-bold text-gray-200'>48</p>
											</div>

											<div className='p-4 bg-gray-700 rounded-lg'>
												<h4 className='text-sm font-medium text-gray-400 mb-2'>
													Reakcje
												</h4>
												<p className='text-2xl font-bold text-gray-200'>156</p>
											</div>
										</div>

										<div className='p-4 bg-gray-700 rounded-lg'>
											<h3 className='font-medium text-gray-200 mb-4'>
												Ulubione tagi
											</h3>
											<div className='flex flex-wrap gap-2'>
												<span className='px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm'>
													#gamedev
												</span>
												<span className='px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm'>
													#opengl
												</span>
												<span className='px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm'>
													#physics
												</span>
												<span className='px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm'>
													#rendering
												</span>
												<span className='px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm'>
													#optimization
												</span>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
