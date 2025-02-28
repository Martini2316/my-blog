import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NewTopicForm from './NewTopicForm';
import EditTopicForm from './EditTopicForm';
import axios from 'axios';
import TopicDashboard from './TopicDashboard';
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
	MessageSquare,
	ThumbsUp,
	ThumbsDown,
	Pencil,
	Trash2,
} from 'lucide-react';

const MainLayout = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');
	const [user, setUser] = useState(null);
	const [showNewTopicModal, setShowNewTopicModal] = useState(false);
	const [editingTopic, setEditingTopic] = useState(null);
	const [categories, setCategories] = useState([]);
	const [tags, setTags] = useState([]);
	const [topics, setTopics] = useState([]);
	const [filteredTopics, setFilteredTopics] = useState([]);
	const [selectedTopic, setSelectedTopic] = useState(null);

	// Filtrowanie tematów przy każdej zmianie searchQuery
	useEffect(() => {
		const filtered = topics.filter(
			(topic) =>
				topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				topic.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(topic.tags &&
					topic.tags.some((tag) =>
						tag.toLowerCase().includes(searchQuery.toLowerCase())
					))
		);
		setFilteredTopics(filtered);
	}, [searchQuery, topics]);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser && storedUser !== 'undefined') {
			try {
				const parsedUser = JSON.parse(storedUser);
				console.log('Zalogowany użytkownik:', parsedUser);
				setUser(parsedUser);
			} catch (error) {
				console.error('Błąd parsowania danych użytkownika:', error);
				localStorage.removeItem('user');
				setUser(null);
			}
		}
	}, []);

	const fetchData = useCallback(async () => {
		try {
			const [categoriesRes, tagsRes, topicsRes] = await Promise.all([
				axios.get('http://localhost:3001/api/categories'),
				axios.get('http://localhost:3001/api/tags'),
				axios.get('http://localhost:3001/api/topics'),
			]);
			setCategories(categoriesRes.data);
			setTags(tagsRes.data);
			setTopics(topicsRes.data);
			setFilteredTopics(topicsRes.data); // Inicjalizacja filtrowanych tematów
			console.log('Fetched topics:', topicsRes.data);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleDeleteTopic = async (topicId) => {
		if (window.confirm('Czy na pewno chcesz usunąć ten temat?')) {
			try {
				await axios.delete(`http://localhost:3001/api/topics/${topicId}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});
				fetchData(); // Odśwież listę po usunięciu
			} catch (error) {
				console.error('Błąd usuwania tematu:', error);
				alert('Wystąpił błąd podczas usuwania tematu');
			}
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('user');
		localStorage.removeItem('token');
		setUser(null);
		navigate('/');
	};

	return (
		<div className='min-h-screen w-full bg-gray-900'>
			{selectedTopic ? (
				<TopicDashboard
					user={user}
					topic={selectedTopic}
					onClose={() => setSelectedTopic(null)}
				/>
			) : (
				<>
					{/* Navbar */}
					<nav className='bg-gray-800 border-b border-gray-700 w-full'>
						<div className='w-full px-4 sm:px-6 lg:px-8'>
							<div className='flex justify-between h-16 items-center'>
								<div className='flex-shrink-0 flex items-center space-x-3'>
									<Terminal className='h-8 w-8 text-emerald-400' />
									<span className='text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent'>
										QuantumFlux
									</span>
								</div>

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
									<div className='flex items-center space-x-4'>
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
						{/* Sidebar */}
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

							{/* Topics Grid */}
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								{/* Add New Topic Tile */}
								{user && user.role === 'admin' && (
									<div
										onClick={() => setShowNewTopicModal(true)}
										className='group bg-gray-800 rounded-lg border border-gray-700 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden h-[200px] flex items-center justify-center cursor-pointer'>
										<Plus className='h-12 w-12 text-gray-600 group-hover:text-emerald-400 transition-colors duration-200' />
									</div>
								)}

								{/* Topic Cards */}
								{filteredTopics.map((topic) => (
									<div
										key={topic.id}
										onClick={() => setSelectedTopic(topic)}
										className='group bg-gray-800 rounded-lg border border-gray-700 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden cursor-pointer relative'>
										<div className='p-6'>
											<div className='flex items-center justify-between mb-3'>
												<div className='flex items-center space-x-2'>
													<Code className='h-5 w-5 text-emerald-400' />
													<span className='text-sm text-gray-400'>
														{topic.category_name || 'Bez kategorii'}
													</span>
												</div>
												<div className='flex items-center space-x-2'>
													<span className='text-xs text-red-500 font-medium'>
														{topic.author_username || 'Anonim'}
													</span>
													{user && user.role === 'admin' && (
														<div className='flex items-center space-x-1'>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	setEditingTopic(topic);
																}}
																className='p-1 text-gray-400 hover:text-emerald-400 transition-colors duration-200'>
																<Pencil className='h-4 w-4' />
															</button>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleDeleteTopic(topic.id);
																}}
																className='p-1 text-gray-400 hover:text-red-400 transition-colors duration-200'>
																<Trash2 className='h-4 w-4' />
															</button>
														</div>
													)}
												</div>
											</div>
											<h3 className='text-xl font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors duration-200 mb-2'>
												{topic.title}
											</h3>
											<p className='text-gray-400 mb-4 line-clamp-2'>
												{topic.description}
											</p>
											<div className='flex justify-between items-center'>
												<span className='text-sm text-gray-500'>
													{new Date(topic.created_at).toLocaleDateString(
														'pl-PL'
													)}
												</span>
												{user && (
													<div className='flex items-center space-x-4'>
														<div className='flex items-center text-sm text-gray-400'>
															<MessageSquare className='h-4 w-4 mr-1' />
															{topic.comments_count}
														</div>
														<div className='flex items-center space-x-2'>
															<div className='flex items-center text-sm text-emerald-400'>
																<ThumbsUp className='h-4 w-4 mr-1' />
																{topic.likes_count || 0}
															</div>
															<div className='flex items-center text-sm text-red-400'>
																<ThumbsDown className='h-4 w-4 mr-1' />
																{topic.dislikes_count || 0}
															</div>
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</>
			)}
			{/* New Topic Modal */}
			{showNewTopicModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<NewTopicForm
						onClose={() => setShowNewTopicModal(false)}
						onSuccess={() => {
							setShowNewTopicModal(false);
							fetchData();
						}}
					/>
				</div>
			)}
			{/* Edit Topic Modal */}
			{editingTopic && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
					<EditTopicForm
						topic={editingTopic}
						onClose={() => setEditingTopic(null)}
						onSuccess={() => {
							setEditingTopic(null);
							fetchData();
						}}
					/>
				</div>
			)}
		</div>
	);
};

export default MainLayout;
