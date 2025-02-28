import React, { useState, useEffect } from 'react';
import {
	ChevronLeft,
	MessageSquare,
	ThumbsUp,
	ThumbsDown,
	Plus,
	User,
	Reply,
	Send,
	X,
	ArrowRight,
	Trash2,
} from 'lucide-react';
import axios from 'axios';

const CommentReply = ({
	reply,
	onLike,
	onDislike,
	user,
	onReply,
	parentComment,
	onDelete,
}) => {
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [replyContent, setReplyContent] = useState('');

	const handleShowReplyForm = () => {
		setReplyContent(`@${reply.author} `);
		setShowReplyForm(true);
	};

	const handleSubmitReply = (e) => {
		e.preventDefault();
		const mentionMatch = replyContent.match(/@(\w+)/);
		const replyTo = mentionMatch ? mentionMatch[1] : reply.author;
		onReply(parentComment.id, replyContent, replyTo);
		setReplyContent('');
		setShowReplyForm(false);
	};

	return (
		<div className='ml-12 mt-2 bg-gray-700/50 rounded-lg p-4 border-l-2 border-emerald-400'>
			<div className='bg-gray-700/30 rounded-lg p-4'>
				<div className='flex items-center justify-between mb-2'>
					<div className='flex items-center space-x-2'>
						<User className='h-4 w-4 text-gray-400' />
						<div className='flex items-center text-sm'>
							<span className='font-medium text-gray-200'>{reply.author}</span>
							{reply.reply_to && (
								<>
									<span className='mx-2 text-gray-400'>→</span>
									<span className='text-emerald-400'>@{reply.reply_to}</span>
								</>
							)}
						</div>
						<span className='text-xs text-gray-500'>
							{new Date(reply.created_at).toLocaleString('pl-PL')}
						</span>
					</div>
					<div className='flex items-center space-x-3'>
						{user?.role === 'admin' && (
							<button
								onClick={() => onDelete(reply.id)}
								className='text-gray-400 hover:text-red-400 transition-colors duration-200'>
								<Trash2 className='h-4 w-4' />
							</button>
						)}
						<button
							onClick={() => user && onLike(reply.id)}
							className={`flex items-center ${
								user
									? 'text-gray-400 hover:text-emerald-400'
									: 'text-gray-600 cursor-not-allowed'
							}`}
							disabled={!user}>
							<ThumbsUp className='h-4 w-4 mr-1' />
							<span className='text-sm'>{reply.likes_count || 0}</span>
						</button>
						<button
							onClick={() => user && onDislike(reply.id)}
							className={`flex items-center ${
								user
									? 'text-gray-400 hover:text-red-400'
									: 'text-gray-600 cursor-not-allowed'
							}`}
							disabled={!user}>
							<ThumbsDown className='h-4 w-4 mr-1' />
							<span className='text-sm'>{reply.dislikes_count || 0}</span>
						</button>
					</div>
				</div>
				<p className='text-gray-300'>{reply.content}</p>

				{user && (
					<div className='mt-2'>
						<button
							onClick={handleShowReplyForm}
							className='flex items-center text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200'>
							<Reply className='h-4 w-4 mr-1' />
							Odpowiedz
						</button>

						{showReplyForm && (
							<form onSubmit={handleSubmitReply} className='mt-4'>
								<textarea
									value={replyContent}
									onChange={(e) => setReplyContent(e.target.value)}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
									placeholder='Napisz odpowiedź...'
									rows='3'
								/>
								<div className='flex justify-end mt-2 space-x-2'>
									<button
										type='button'
										onClick={() => setShowReplyForm(false)}
										className='px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200'>
										Anuluj
									</button>
									<button
										type='submit'
										className='flex items-center px-3 py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200'>
										<Send className='h-4 w-4 mr-1' />
										Wyślij
									</button>
								</div>
							</form>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

const Comment = ({
	comment,
	onLike,
	onDislike,
	onReply,
	isAdmin,
	user,
	onDelete,
}) => {
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [replyContent, setReplyContent] = useState('');

	const handleSubmitReply = (e) => {
		e.preventDefault();
		const mentionMatch = replyContent.match(/@(\w+)/);
		const replyTo = mentionMatch ? mentionMatch[1] : comment.author;
		onReply(comment.id, replyContent, replyTo);
		setReplyContent('');
		setShowReplyForm(false);
	};

	const handleShowReplyForm = () => {
		setReplyContent(`@${comment.author} `);
		setShowReplyForm(true);
	};

	return (
		<div className='bg-gray-800 rounded-lg p-6'>
			<div className='flex items-center justify-between mb-4'>
				<div className='flex items-center space-x-2'>
					<User className='h-5 w-5 text-gray-400' />
					<span
						className={`font-medium ${
							isAdmin ? 'text-red-400' : 'text-gray-200'
						}`}>
						{comment.author}
					</span>
					<span className='text-sm text-gray-500'>
						{new Date(comment.created_at).toLocaleString('pl-PL', {
							year: 'numeric',
							month: 'numeric',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})}
					</span>
				</div>
				<div className='flex items-center space-x-3'>
					{user?.role === 'admin' && (
						<button
							onClick={() => onDelete(comment.id)}
							className='text-gray-400 hover:text-red-400 transition-colors duration-200'>
							<Trash2 className='h-5 w-5' />
						</button>
					)}
					<button
						onClick={() => onLike(comment.id)}
						className='flex items-center text-gray-400 hover:text-emerald-400 transition-colors duration-200'>
						<ThumbsUp className='h-4 w-4 mr-1' />
						<span>{comment.likes_count || 0}</span>
					</button>
					<button
						onClick={() => onDislike(comment.id)}
						className='flex items-center text-gray-400 hover:text-red-400 transition-colors duration-200'>
						<ThumbsDown className='h-4 w-4 mr-1' />
						<span>{comment.dislikes_count || 0}</span>
					</button>
				</div>
			</div>
			<p className='text-gray-300 mb-4'>{comment.content}</p>

			{user && !isAdmin && (
				<div className='mt-4'>
					<button
						onClick={handleShowReplyForm}
						className='flex items-center text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200'>
						<Reply className='h-4 w-4 mr-1' />
						Odpowiedz
					</button>

					{showReplyForm && (
						<form onSubmit={handleSubmitReply} className='mt-4'>
							<textarea
								value={replyContent}
								onChange={(e) => setReplyContent(e.target.value)}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent'
								placeholder='Napisz odpowiedź...'
								rows='3'
							/>
							<div className='flex justify-end mt-2 space-x-2'>
								<button
									type='button'
									onClick={() => setShowReplyForm(false)}
									className='px-3 py-1 text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200'>
									Anuluj
								</button>
								<button
									type='submit'
									className='flex items-center px-3 py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200'>
									<Send className='h-4 w-4 mr-1' />
									Wyślij
								</button>
							</div>
						</form>
					)}
				</div>
			)}

			{/* Replies */}
			{comment.replies &&
				comment.replies.map((reply) => (
					<CommentReply
						key={reply.id}
						reply={reply}
						onLike={onLike}
						onDislike={onDislike}
						user={user}
						onReply={onReply}
						parentComment={comment}
						onDelete={onDelete}
					/>
				))}
		</div>
	);
};

const TopicDashboard = ({ topic, onClose, user }) => {
	const [comments, setComments] = useState([]);
	const [newCommentContent, setNewCommentContent] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [showNewCommentForm, setShowNewCommentForm] = useState(false);

	useEffect(() => {
		fetchComments();
	}, [topic.id]);

	const fetchComments = async () => {
		try {
			const response = await axios.get(
				`http://localhost:3001/api/topics/${topic.id}/comments`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			setComments(response.data);
		} catch (error) {
			console.error('Błąd pobierania komentarzy:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddComment = async (e) => {
		e.preventDefault();
		try {
			await axios.post(
				`http://localhost:3001/api/topics/${topic.id}/comments`,
				{ content: newCommentContent },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			setNewCommentContent('');
			setShowNewCommentForm(false);
			fetchComments(); // Odśwież listę komentarzy
		} catch (error) {
			console.error('Błąd dodawania komentarza:', error);
		}
	};

	const handleAddReply = async (commentId, content, replyTo) => {
		try {
			await axios.post(
				`http://localhost:3001/api/comments/${commentId}/replies`,
				{
					content,
					replyTo,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			fetchComments();
		} catch (error) {
			console.error('Błąd dodawania odpowiedzi:', error);
		}
	};

	const handleLike = async (commentId) => {
		try {
			await axios.post(
				`http://localhost:3001/api/comments/${commentId}/reaction`,
				{ type: 'like' },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			fetchComments();
		} catch (error) {
			console.error('Błąd dodawania reakcji:', error);
		}
	};

	const handleDislike = async (commentId) => {
		try {
			await axios.post(
				`http://localhost:3001/api/comments/${commentId}/reaction`,
				{ type: 'dislike' },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			fetchComments();
		} catch (error) {
			console.error('Błąd dodawania reakcji:', error);
		}
	};

	const handleDeleteComment = async (commentId) => {
		if (
			window.confirm(
				'Czy na pewno chcesz usunąć ten wpis i wszystkie jego odpowiedzi?'
			)
		) {
			try {
				await axios.delete(`http://localhost:3001/api/comments/${commentId}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});
				fetchComments();
			} catch (error) {
				console.error('Błąd usuwania komentarza:', error);
			}
		}
	};

	return (
		<div className='min-h-screen bg-gray-900 text-gray-100'>
			{/* Header */}
			<div className='bg-gray-800 border-b border-gray-700'>
				<div className='max-w-6xl mx-auto px-4 py-4'>
					<button
						onClick={onClose}
						className='flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-200'>
						<ChevronLeft className='h-5 w-5 mr-2' />
						Powrót
					</button>
				</div>
			</div>

			{/* Topic content */}
			<div className='max-w-6xl mx-auto px-4 py-8'>
				<div className='bg-gray-800 rounded-lg p-6 mb-8'>
					<div className='mb-6'>
						<div className='flex items-center justify-between mb-4'>
							<span className='text-sm text-emerald-400'>
								{topic.category_name}
							</span>
							<span className='text-sm text-gray-400'>
								{new Date(topic.created_at).toLocaleDateString('pl-PL')}
							</span>
						</div>
						<h1 className='text-3xl font-bold mb-4'>{topic.title}</h1>
						<p className='text-gray-300 mb-6'>{topic.description}</p>
						<div className='flex items-center justify-between'>
							<div className='flex items-center space-x-2'>
								<User className='h-5 w-5 text-gray-400' />
								<span className='text-gray-400'>{topic.author_username}</span>
							</div>
							<div className='flex space-x-2'>
								{topic.tags &&
									topic.tags.map((tag) => (
										<span
											key={tag}
											className='px-3 py-1 bg-gray-700 text-emerald-400 rounded-full text-sm'>
											#{tag}
										</span>
									))}
							</div>
						</div>
					</div>
				</div>

				{/* Comments section */}
				<div className='max-w-6xl mx-auto px-4 py-8'>
					<div className='space-y-6'>
						<div className='flex items-center justify-between'>
							<h2 className='text-xl font-semibold'>Wpisy</h2>
							<span className='text-sm text-gray-400'>
								{comments.length} {comments.length === 1 ? 'wpis' : 'wpisów'}
							</span>
						</div>

						{/* Grid dla wpisów */}
						<div className='grid grid-cols-1 gap-6'>
							{/* Admin's New Post Tile */}
							{user?.role === 'admin' && (
								<div
									onClick={() => setShowNewCommentForm(true)}
									className='group bg-gray-800 rounded-lg border border-gray-700 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden cursor-pointer h-32'>
									<div className='flex flex-col items-center justify-center h-full space-y-2'>
										<Plus className='h-8 w-8 text-gray-600 group-hover:text-emerald-400 transition-colors duration-200' />
										<span className='text-sm text-gray-500 group-hover:text-emerald-400 transition-colors duration-200'>
											Dodaj nowy wpis
										</span>
									</div>
								</div>
							)}

							{/* New Comment Form Modal */}
							{showNewCommentForm && (
								<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
									<div className='bg-gray-800 rounded-lg p-6 w-full max-w-2xl'>
										<div className='flex justify-between items-center mb-4'>
											<h3 className='text-lg font-semibold'>Nowy wpis</h3>
											<button
												onClick={() => setShowNewCommentForm(false)}
												className='text-gray-400 hover:text-gray-200'>
												<X className='h-5 w-5' />
											</button>
										</div>
										<form onSubmit={handleAddComment}>
											<textarea
												value={newCommentContent}
												onChange={(e) => setNewCommentContent(e.target.value)}
												className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none'
												placeholder='Treść wpisu...'
												rows='6'
											/>
											<div className='flex justify-end mt-4 space-x-3'>
												<button
													type='button'
													onClick={() => setShowNewCommentForm(false)}
													className='px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors duration-200'>
													Anuluj
												</button>
												<button
													type='submit'
													className='px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200 flex items-center'>
													<Send className='h-4 w-4 mr-2' />
													Opublikuj
												</button>
											</div>
										</form>
									</div>
								</div>
							)}

							{/* Existing Comments */}
							{comments.map((comment) => (
								<Comment
									key={comment.id}
									comment={comment}
									onLike={handleLike}
									onDislike={handleDislike}
									onReply={handleAddReply}
									onDelete={handleDeleteComment}
									isAdmin={comment.is_admin}
									user={user}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopicDashboard;
