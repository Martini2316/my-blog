import React, { useState, useEffect } from 'react';
import { X, Hash } from 'lucide-react';
import axios from 'axios';

const NewTopicForm = ({ onClose }) => {
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		category: '',
		tags: '',
	});
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [existingTags, setExistingTags] = useState([]);

	useEffect(() => {
		// Pobieranie istniejących kategorii i tagów
		const fetchData = async () => {
			try {
				const [categoriesRes, tagsRes] = await Promise.all([
					axios.get('http://localhost:3001/api/categories'),
					axios.get('http://localhost:3001/api/tags'),
				]);
				setCategories(categoriesRes.data);
				setExistingTags(tagsRes.data);
			} catch (error) {
				console.error('Błąd pobierania danych:', error);
			}
		};
		fetchData();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		// Przygotowanie tagów (usunięcie #, separacja po przecinkach)
		const tagsArray = formData.tags
			.split(',')
			.map((tag) => tag.trim().replace(/^#/, ''))
			.filter((tag) => tag.length > 0);

		console.log('Wysyłane dane:', {
			title: formData.title,
			description: formData.description,
			category: formData.category,
			tags: tagsArray,
		});

		try {
			const response = await axios.post(
				'http://localhost:3001/api/topics',
				{
					title: formData.title,
					description: formData.description,
					category: formData.category,
					tags: tagsArray,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			console.log('Odpowiedź serwera:', response.data);
			onClose();
		} catch (error) {
			console.error('Błąd:', error.response?.data || error);
			setError(
				error.response?.data?.error || 'Wystąpił błąd podczas dodawania tematu'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<div className='w-full max-w-2xl mx-auto bg-gray-800 rounded-lg p-6'>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-bold text-gray-100'>Nowy temat</h2>
				<button
					onClick={onClose}
					className='text-gray-400 hover:text-gray-200 transition-colors duration-200'>
					<X className='h-5 w-5' />
				</button>
			</div>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Tytuł
					</label>
					<input
						type='text'
						name='title'
						value={formData.title}
						onChange={handleChange}
						className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
						placeholder='Wprowadź tytuł tematu'
						required
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Kategoria
					</label>
					<div className='relative'>
						<input
							type='text'
							name='category'
							value={formData.category}
							onChange={handleChange}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
							placeholder='Wprowadź lub wybierz kategorię'
							required
						/>
						{categories.length > 0 && (
							<div className='absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-40 overflow-y-auto'>
								{categories
									.filter((cat) =>
										cat.name
											.toLowerCase()
											.includes(formData.category.toLowerCase())
									)
									.map((cat) => (
										<div
											key={cat.id}
											onClick={() =>
												setFormData((prev) => ({ ...prev, category: cat.name }))
											}
											className='px-3 py-2 hover:bg-gray-600 cursor-pointer text-gray-200'>
											{cat.name}
										</div>
									))}
							</div>
						)}
					</div>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Opis
					</label>
					<textarea
						name='description'
						value={formData.description}
						onChange={handleChange}
						rows='4'
						className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
						placeholder='Wprowadź opis tematu'
						required
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Tagi
					</label>
					<div className='relative'>
						<Hash className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
						<input
							type='text'
							name='tags'
							value={formData.tags}
							onChange={handleChange}
							className='w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
							placeholder='graphics, physics, opengl (oddziel przecinkami)'
						/>
					</div>
					{existingTags.length > 0 && (
						<div className='mt-2 flex flex-wrap gap-2'>
							{existingTags.map((tag) => (
								<button
									key={tag.id}
									type='button'
									onClick={() => {
										const currentTags = formData.tags
											.split(',')
											.map((t) => t.trim())
											.filter((t) => t !== '');
										if (!currentTags.includes(tag.name)) {
											setFormData((prev) => ({
												...prev,
												tags: prev.tags
													? `${prev.tags}, ${tag.name}`
													: tag.name,
											}));
										}
									}}
									className='px-2 py-1 text-xs bg-gray-700 text-emerald-400 rounded-full hover:bg-gray-600 transition-colors duration-200'>
									#{tag.name}
								</button>
							))}
						</div>
					)}
				</div>

				{error && <div className='text-red-500 text-sm'>{error}</div>}

				<div className='flex justify-end space-x-4'>
					<button
						type='button'
						onClick={onClose}
						className='px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors duration-200'>
						Anuluj
					</button>
					<button
						type='submit'
						disabled={isLoading}
						className='px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
						{isLoading ? 'Dodawanie...' : 'Dodaj temat'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default NewTopicForm;
