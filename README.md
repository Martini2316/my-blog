# QuantumFlux Community Platform

QuantumFlux is a modern, responsive community platform designed for developers and technology enthusiasts to connect, share knowledge, and discuss topics related to game development, programming, and technology.

**ADMIN login:** *test@test.test* / **passwd:** *password*  
**USER login:** *user1@test.t* / **passwd:** *password*

## Features

- **User Authentication System**: Secure login and registration with JWT-based authentication
- **User Profiles**: Customizable profiles with avatars, bio, social links, and activity tracking
- **Topic Management**: Create, edit, and delete topics with category and tag organization
- **Responsive Design**: Modern UI built with React and Tailwind CSS for full responsiveness
- **Admin Controls**: Special privileges for admin users to manage content
- **Dark Mode**: Clean, dark-themed interface for better readability

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Lucide React (for icons)
- Axios (for API requests)
- React Router (for navigation)

### Backend
- Node.js
- Express.js
- MySQL (database)
- JWT (JSON Web Tokens for authentication)
- bcrypt (for password hashing)

## Installation

### Prerequisites
- Node.js (v14+ recommended)
- MySQL server
- npm or yarn

### Database Setup
1. Create a MySQL database for the application
2. Import the database schema from the `schema.sql` file:
   ```bash
   mysql -u your_username -p your_database_name < schema.sql
   ```

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quantumflux.git
   cd quantumflux
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the server:
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Install client dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production build:
   ```bash
   npm run build
   ```

## API Endpoints

### Authentication
- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Topics
- `GET /api/topics` - Get all topics
- `POST /api/topics` - Create a new topic (protected)
- `PUT /api/topics/:id` - Update a topic (protected)
- `DELETE /api/topics/:id` - Delete a topic (protected)

### Categories & Tags
- `GET /api/categories` - Get all categories
- `GET /api/tags` - Get all tags

### User Profile
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)
- `PUT /api/user/avatar` - Update user avatar (protected)
- `PUT /api/user/password` - Update user password (protected)
- `GET /api/user/activity` - Get user activity (protected)

## Database Structure

The application uses the following main tables:

- `users` - User information (id, username, email, password, etc.)
- `user_profiles` - Extended user profile data
- `topics` - Discussion topics
- `categories` - Topic categories
- `tags` - Topic tags
- `topic_tags` - Mapping between topics and tags
- `comments` - User comments on topics
- `reactions` - User reactions to topics and comments

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
- [Lucide Icons](https://lucide.dev/)
