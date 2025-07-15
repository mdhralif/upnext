# UpNext - Todo Application

A modern, full-stack todo application built with Next.js, Node.js, and PostgreSQL featuring drag-and-drop task reordering, user authentication, and responsive design.

## Features

- **User Authentication** - Secure login/register with JWT tokens
- **Task Management** - Create, edit, delete, and complete tasks
- **Drag & Drop Ordering** - Reorder tasks with intuitive drag-and-drop
- **Advanced Filtering** - Filter by status, priority, completion, and search
- **Statistics Dashboard** - View task completion statistics
- **Responsive Design** - Optimized for mobile and desktop
- **Real-time Updates** - Instant UI updates with optimistic updates

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **@dnd-kit** - Modern drag-and-drop library
- **React Hook Form** - Performant forms with validation
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Beautiful notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma ORM** - Next-generation ORM
- **PostgreSQL** - Robust relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use Neon/Railway)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdhralif/upnext.git
   cd upnext
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   **Backend** (`backend/.env`):
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_super_secret_jwt_key"
   NODE_ENV="development"
   PORT=5000
   ```
   
   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   NEXT_PUBLIC_APP_NAME="UpNext Todo"
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the application**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

##  Project Structure

```
upnext/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Auth, CORS, error handling
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Express server
│   ├── prisma/
│   │   ├── migrations/      # Database migrations
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React Context providers
│   │   ├── lib/             # Utilities and API functions
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── docs/                    # API documentation
├── docker-compose.yml       # Docker configuration
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `PATCH /api/tasks/reorder` - Reorder tasks

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/stats` - Get user statistics

## 🔧 Key Features Implementation

### Drag & Drop Reordering
- Uses `@dnd-kit/sortable` for accessible drag-and-drop
- Optimistic UI updates with server synchronization
- Touch-friendly mobile support

### Authentication System
- JWT-based authentication with refresh tokens
- Protected routes with middleware
- Automatic token refresh on API calls

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Separate mobile and desktop layouts for optimal UX
- Touch-optimized controls for mobile devices

## Deployment

### Using Docker
```bash
docker-compose up --build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

Built by [mdhralif](https://github.com/mdhralif)
