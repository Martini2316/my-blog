import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<MainLayout />} />
				<Route path='/auth' element={<AuthPage />} />
				<Route path='/profile' element={<ProfilePage />} />
			</Routes>
		</Router>
	);
}

export default App;
