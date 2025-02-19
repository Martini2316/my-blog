import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewTopicForm from './NewTopicForm';
import axios from 'axios';
import {
	LogIn,
	Code,
	Database,
	Cpu,
	Terminal,
	Search,
	TrendingUp,
	Clock,
	LogOut,
	Settings,
	Shield,
	Plus,
	X,
} from 'lucide-react';

const MainLayout = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');
	const [user, setUser] = useState(null);
	const [showNewTopicModal, setShowNewTopicModal] = useState(false);
	const [categories, setCategories] = useState([]);
	const [tags, setTags] = useState([]);

	// Symulacja pobrania użytkownika z localStorage
	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser && storedUser !== 'undefined') {
			try {
				const parsedUser = JSON.parse(storedUser);
				console.log('Zalogowany użytkownik:', parsedUser); // dodaj to
				setUser(parsedUser);
			} catch (error) {
				console.error('Błąd parsowania danych użytkownika:', error);
				localStorage.removeItem('user');
				setUser(null);
			}
		}
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [categoriesRes, tagsRes] = await Promise.all([
					axios.get('http://localhost:3001/api/categories'),
					axios.get('http://localhost:3001/api/tags'),
				]);
				setCategories(categoriesRes.data);
				setTags(tagsRes.data);
			} catch (error) {
				console.error('Błąd pobierania danych:', error);
			}
		};
		fetchData();
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		setUser(null);
		navigate('/');
	};

	const topics = []; // Tu będą pobierane tematy z API

	return (
		<div className='min-h-screen w-full bg-gray-900'>
			{/* Navbar z wyszukiwarką */}
			<nav className='bg-gray-800 border-b border-gray-700 w-full'>
				<div className='w-full px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-16 items-center'>
						<div className='flex-shrink-0 flex items-center space-x-3'>
							<Terminal className='h-8 w-8 text-emerald-400' />
							<span className='text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent'>
								QuantumFlux
							</span>
						</div>

						{/* Wyszukiwarka */}
						<div className='flex-1 max-w-lg mx-8'>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Search className='h-5 w-5 text-gray-400' />
								</div>
								<input
									type='text'
									className='block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-gray-800 transition-colors duration-200'
									placeholder='Szukaj tematów...'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>

						{user ? (
							// Panel zalogowanego użytkownika
							<div className='flex items-center space-x-4'>
								{console.log('Rola użytkownika:', user.role)}
								<div className='flex items-center space-x-2'>
									<span
										className={`${
											user.role && user.role.toLowerCase() === 'admin'
												? 'text-red-500 font-bold'
												: 'text-emerald-400 font-semibold'
										}`}>
										{user.username}
									</span>
									{user.role === 'admin' && (
										<Shield className='h-4 w-4 text-red-500' />
									)}
								</div>
								<button
									onClick={() => navigate('/profile')}
									className='p-2 text-gray-400 hover:text-gray-200 transition-colors duration-200'>
									<Settings className='h-5 w-5' />
								</button>
								<button
									onClick={handleLogout}
									className='flex items-center px-3 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200'>
									<LogOut className='h-4 w-4 mr-2' />
									Wyloguj
								</button>
							</div>
						) : (
							<button
								onClick={() => navigate('/auth')}
								className='flex items-center px-4 py-2 text-sm font-medium text-gray-100 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200'>
								<LogIn className='h-4 w-4 mr-2' />
								Log in
							</button>
						)}
					</div>
				</div>
			</nav>

			<div className='flex'>
				{/* Sidebar z sekcjami */}
				<div className='w-64 min-h-screen bg-gray-800 border-r border-gray-700'>
					<div className='p-4'>
						<h2 className='text-lg font-semibold text-gray-100 mb-4 px-2'>
							Kategorie
						</h2>
						<ul className='space-y-2 mb-8'>
							{categories.length > 0 ? (
								categories.map((category) => (
									<li
										key={category.id}
										className='flex items-center px-2 py-2 text-gray-300 hover:bg-gray-700 hover:text-emerald-400 rounded-md cursor-pointer transition-colors duration-200'>
										<Code className='h-4 w-4 mr-2' />
										{category.name}
									</li>
								))
							) : (
								<li className='text-gray-500 text-sm italic px-2'>
									Tu pojawią się kategorie
								</li>
							)}
						</ul>

						{/* Popularne tagi */}
						<h3 className='text-sm font-semibold text-gray-400 mb-2 px-2'>
							Popularne tagi
						</h3>
						<div className='flex flex-wrap gap-2 px-2'>
							{tags.length > 0 ? (
								tags.map((tag) => (
									<span
										key={tag.id}
										className='text-xs px-2 py-1 bg-gray-700 text-emerald-400 rounded-full'>
										#{tag.name}
									</span>
								))
							) : (
								<span className='text-gray-500 text-sm italic'>
									Tu pojawią się popularne tagi
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Main content */}
				<div className='flex-1 p-8 w-full'>
					{/* Filtry i sortowanie */}
					<div className='mb-8 flex justify-between items-center'>
						<div className='flex space-x-4'>
							<button className='flex items-center px-3 py-2 text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200'>
								<TrendingUp className='h-4 w-4 mr-2' />
								Popularne
							</button>
							<button className='flex items-center px-3 py-2 text-sm text-gray-300 hover:text-emerald-400 transition-colors duration-200'>
								<Clock className='h-4 w-4 mr-2' />
								Najnowsze
							</button>
						</div>
					</div>

					{!user && topics.length > 0 && (
						<div className='w-full text-center py-4 bg-gray-800 rounded-lg mb-6'>
							<p className='text-gray-400'>
								Zaloguj się, aby móc komentować i reagować na tematy.
							</p>
						</div>
					)}

					{/* Grid z kafelkami */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{/* Kafelek dodawania nowego tematu - tylko dla admina */}
						{user && user.role === 'admin' && (
							<div
								onClick={() => setShowNewTopicModal(true)}
								className='group bg-gray-800 rounded-lg border border-gray-700 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden cursor-pointer h-[200px] flex items-center justify-center'>
								<Plus className='h-12 w-12 text-gray-600 group-hover:text-emerald-400 transition-colors duration-200' />
							</div>
						)}

						{/* Tu będą wyświetlane tematy */}
						{topics.map((topic) => (
							<div
								key={topic.id}
								className='group bg-gray-800 rounded-lg border border-gray-700 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden'>
								<div className='p-6'>
									<div className='flex items-center justify-between mb-3'>
										<div className='flex items-center space-x-2'>
											<Code className='h-5 w-5 text-emerald-400' />
											<span className='text-sm text-gray-400'>
												{topic.category}
											</span>
										</div>
										{/* Informacja o autorze - admin */}
										<span className='text-xs text-red-500 font-medium'>
											Autor: {topic.author}
										</span>
									</div>
									<h3 className='text-xl font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors duration-200 mb-2'>
										{topic.title}
									</h3>
									<p className='text-gray-400 mb-4 line-clamp-2'>
										{topic.description}
									</p>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-gray-500'>
											{topic.createdAt}
										</span>
										{user && (
											<div className='flex items-center space-x-4'>
												<button className='flex items-center text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200'>
													<MessageSquare className='h-4 w-4 mr-1' />
													{topic.commentsCount}
												</button>
												<button className='flex items-center text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200'>
													<ThumbsUp className='h-4 w-4 mr-1' />
													{topic.likesCount}
												</button>
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Modal do tworzenia nowego tematu */}
			{showNewTopicModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<NewTopicForm onClose={() => setShowNewTopicModal(false)} />
				</div>
			)}
		</div>
	);
};

export default MainLayout;
