# Election Engagement Platform

A comprehensive platform for engaging with Nigeria elections, featuring real-time voting, news, comments, and chat functionality.

## 🚀 Features

- **Election Management**: Track elections across African countries
- **Voting System**: Cast votes and view real-time statistics
- **News & Updates**: Stay informed with election news
- **Community Engagement**: Comments, reactions, and discussions
- **Live Chat**: Real-time chat rooms for countries, elections, and candidates
- **Admin Dashboard**: Complete CRUD operations for all entities

## 📦 Project Structure

```
Election-Engagement--main/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── database/    # Database schema & connection
│   │   └── middleware/  # Auth & error handling
│   └── package.json
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── context/        # React Context providers
│   ├── services/       # API service layer
│   └── utils/          # Utilities & types
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- TypeScript
- Supabase (PostgreSQL)
- JWT Authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm (or npm)

### Backend Setup

1. **Navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Setup Supabase database**
```bash
# Go to Supabase Dashboard → SQL Editor
# Run the SQL script from ../src/database.sql
# See backend/SUPABASE_SETUP.md for detailed instructions
```

5. **Start backend server**
```bash
pnpm dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. **Install dependencies**
```bash
pnpm install
```

2. **Configure API URL**
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

3. **Start development server**
```bash
pnpm dev
```

Frontend will run on `http://localhost:5173`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All authenticated endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Countries
- `GET /countries` - Get all countries
- `GET /countries/:id` - Get country by ID
- `POST /countries` - Create country (Admin)
- `PUT /countries/:id` - Update country (Admin)
- `DELETE /countries/:id` - Delete country (Admin)

#### Elections
- `GET /elections` - Get all elections
- `GET /elections/:id` - Get election by ID
- `GET /elections/:id/stats` - Get vote statistics
- `POST /elections` - Create election (Admin)
- `PUT /elections/:id` - Update election (Admin)
- `DELETE /elections/:id` - Delete election (Admin)

#### Candidates
- `GET /candidates` - Get all candidates
- `GET /candidates?electionId=:id` - Get candidates for election
- `GET /candidates/:id` - Get candidate by ID
- `POST /candidates` - Create candidate (Admin)
- `PUT /candidates/:id` - Update candidate (Admin)
- `DELETE /candidates/:id` - Delete candidate (Admin)

#### Votes
- `POST /votes` - Cast a vote (Authenticated)
- `GET /votes/check/:electionId` - Check if user voted
- `GET /votes/user` - Get user's votes

#### News
- `GET /news` - Get all news
- `GET /news?countryId=:id` - Get news for country
- `GET /news?priority=:level` - Filter by priority
- `GET /news/:id` - Get news by ID
- `POST /news` - Create news (Admin)
- `PUT /news/:id` - Update news (Admin)
- `DELETE /news/:id` - Delete news (Admin)

#### Comments
- `GET /comments/election/:id` - Get comments for election
- `POST /comments` - Create comment (Authenticated)
- `POST /comments/:id/like` - Like/unlike comment
- `POST /comments/:id/reaction` - Add reaction
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

#### Chat
- `GET /chat/rooms` - Get all chat rooms
- `GET /chat/rooms/:id` - Get room by ID
- `GET /chat/rooms/:id/messages` - Get messages
- `POST /chat/rooms/:id/messages` - Send message
- `POST /chat/rooms` - Create room (Admin)
- `PUT /chat/rooms/:id` - Update room (Admin)
- `DELETE /chat/rooms/:id` - Delete room (Admin)

See `CRUD_IMPLEMENTATION.md` for complete API documentation.

## 🗄️ Database Schema

The database uses **Supabase** (PostgreSQL). The schema includes:
- Users & Authentication
- Countries & Elections
- Candidates & Votes
- News (with tags & hashtags)
- Comments (with likes & reactions)
- Chat Rooms & Messages
- Platform Settings

**Setup:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL script from `src/database.sql`
3. See `backend/SUPABASE_SETUP.md` for complete setup instructions

**Project ID**: `pwcmyidxdyetvyiuosnm`

## 🔐 Authentication

### Register
```typescript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "pin": "1234",
  "phone": "+1234567890"
}
```

### Login
```typescript
POST /api/auth/login
{
  "email": "john@example.com",
  "pin": "1234"
}
```

Response includes JWT token:
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 📝 Frontend Services

All API services are available in `/src/services/`:

- `apiClient.ts` - Base API client
- `authService.ts` - Authentication
- `countryService.ts` - Countries
- `electionService.ts` - Elections
- `candidateService.ts` - Candidates
- `voteService.ts` - Votes
- `newsService.ts` - News
- `commentService.ts` - Comments
- `chatService.ts` - Chat
- `settingsService.ts` - Settings

### Usage Example

```typescript
import { countryService } from './services/countryService';

// Fetch countries
const countries = await countryService.getAll();

// Create country (Admin)
const newCountry = await countryService.create({
  name: 'Nigeria',
  flag: '🇳🇬',
  code: 'NG'
});
```

## 🎨 Admin Dashboard

Access admin dashboard at `/admin` (requires admin user).

Admin pages with full CRUD:
- Countries Management
- Elections Management
- Candidates Management
- News Management
- Comment Moderation
- Chat Management
- Analytics Dashboard
- Platform Settings

## 📖 Documentation

- `CRUD_IMPLEMENTATION.md` - Complete CRUD documentation
- `backend/README.md` - Backend API documentation
- `src/database.sql` - Database schema

## 🧪 Development

### Backend
```bash
cd backend
pnpm dev          # Start dev server
pnpm build        # Build for production
# Database managed via Supabase Dashboard
```

### Frontend
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

## 🚢 Deployment

### Backend
1. Set environment variables
2. Run database migrations
3. Build: `pnpm build`
4. Start: `pnpm start`

### Frontend
1. Set `VITE_API_BASE_URL` environment variable
2. Build: `pnpm build`
3. Deploy `dist/` folder

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.
