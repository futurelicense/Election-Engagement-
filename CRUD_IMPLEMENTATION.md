# Election Engagement Platform - Complete CRUD Implementation

## 📋 Overview

This document outlines the complete CRUD (Create, Read, Update, Delete) implementation for the Election Engagement Platform. The system includes both backend API and frontend service layers.

## 🏗️ Architecture

### Backend (Node.js/Express/TypeScript)
- **Location**: `/backend`
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT-based
- **API**: RESTful endpoints

### Frontend (React/TypeScript)
- **Location**: `/src`
- **Services**: Type-safe API client layer
- **Context**: React Context for state management
- **Components**: Admin pages with CRUD operations

## 📦 Entities & CRUD Operations

### 1. Countries ✅
**Backend**: `/backend/src/routes/countries.ts`  
**Frontend Service**: `/src/services/countryService.ts`

- ✅ GET all countries
- ✅ GET country by ID
- ✅ POST create country (Admin)
- ✅ PUT update country (Admin)
- ✅ DELETE country (Admin)
- ✅ GET elections for country

### 2. Elections ✅
**Backend**: `/backend/src/routes/elections.ts`  
**Frontend Service**: `/src/services/electionService.ts`

- ✅ GET all elections
- ✅ GET election by ID
- ✅ POST create election (Admin)
- ✅ PUT update election (Admin)
- ✅ DELETE election (Admin)
- ✅ GET vote statistics

### 3. Candidates ✅
**Backend**: `/backend/src/routes/candidates.ts`  
**Frontend Service**: `/src/services/candidateService.ts`

- ✅ GET all candidates (with optional electionId filter)
- ✅ GET candidate by ID
- ✅ POST create candidate (Admin)
- ✅ PUT update candidate (Admin)
- ✅ DELETE candidate (Admin)

### 4. Votes ✅
**Backend**: `/backend/src/routes/votes.ts`  
**Frontend Service**: `/src/services/voteService.ts`

- ✅ POST cast vote (Authenticated)
- ✅ GET check if user voted
- ✅ GET user's votes

### 5. News ✅
**Backend**: `/backend/src/routes/news.ts`  
**Frontend Service**: `/src/services/newsService.ts`

- ✅ GET all news (with optional countryId & priority filters)
- ✅ GET news by ID
- ✅ POST create news (Admin)
- ✅ PUT update news (Admin)
- ✅ DELETE news (Admin)
- ✅ Tags and hashtags support

### 6. Comments ✅
**Backend**: `/backend/src/routes/comments.ts`  
**Frontend Service**: `/src/services/commentService.ts`

- ✅ GET comments for election
- ✅ POST create comment (Authenticated)
- ✅ POST like/unlike comment
- ✅ POST add reaction
- ✅ PUT update comment (Owner/Admin)
- ✅ DELETE comment (Owner/Admin)
- ✅ GET all comments for moderation (Admin)

### 7. Chat Rooms & Messages ✅
**Backend**: `/backend/src/routes/chat.ts`  
**Frontend Service**: `/src/services/chatService.ts`

**Chat Rooms:**
- ✅ GET all rooms (with optional type & entityId filters)
- ✅ GET room by ID
- ✅ POST create room (Admin)
- ✅ PUT update room (Admin)
- ✅ DELETE room (Admin)

**Messages:**
- ✅ GET messages for room
- ✅ POST send message (Authenticated)
- ✅ PUT update message (Owner/Admin)
- ✅ DELETE message (Owner/Admin)
- ✅ GET flagged messages (Admin)

### 8. Settings ✅
**Backend**: `/backend/src/routes/settings.ts`  
**Frontend Service**: `/src/services/settingsService.ts`

- ✅ GET all settings
- ✅ GET setting by key
- ✅ PUT update setting (Admin)
- ✅ DELETE setting (Admin)

### 9. Authentication ✅
**Backend**: `/backend/src/routes/auth.ts`  
**Frontend Service**: `/src/services/authService.ts`

- ✅ POST register user
- ✅ POST login user

## 🔐 Authentication & Authorization

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token
3. Frontend stores token in localStorage
4. All authenticated requests include token in `Authorization: Bearer <token>` header

### Authorization Levels
- **Public**: No authentication required
- **Authenticated**: Requires valid JWT token
- **Admin**: Requires JWT token with `isAdmin: true`

## 📝 Frontend Integration

### Using Services in Components

```typescript
import { countryService } from '../services/countryService';

// Fetch countries
const countries = await countryService.getAll();

// Create country (Admin)
const newCountry = await countryService.create({
  name: 'Nigeria',
  flag: '🇳🇬',
  code: 'NG'
});

// Update country
await countryService.update(countryId, { name: 'Updated Name' });

// Delete country
await countryService.delete(countryId);
```

### Error Handling

```typescript
try {
  const countries = await countryService.getAll();
} catch (error) {
  console.error('Failed to fetch countries:', error);
  // Handle error (show toast, etc.)
}
```

## 🚀 Setup Instructions

### Backend Setup

1. **Install dependencies**
```bash
cd backend
pnpm install
```

2. **Setup Supabase database**
```bash
# Go to Supabase Dashboard → SQL Editor
# Run the SQL script from ../src/database.sql
# See backend/SUPABASE_SETUP.md for detailed instructions
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

4. **Start server**
```bash
pnpm dev
```

### Frontend Setup

1. **Configure API URL**
Create `.env` file in root:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

2. **Update contexts** (Optional - can use mock data fallback)
The services are ready to use. Update contexts to call APIs instead of mock data.

## 📊 Admin Pages Integration

All admin pages have CRUD UI ready. To connect to API:

### Example: AdminCandidates.tsx

```typescript
import { candidateService } from '../../services/candidateService';

// In component
const handleSubmit = async (candidate: Partial<Candidate>) => {
  try {
    if (selectedCandidate) {
      await candidateService.update(selectedCandidate.id, candidate);
    } else {
      await candidateService.create(candidate as Omit<Candidate, 'id'>);
    }
    // Refresh list
    await loadCandidates();
  } catch (error) {
    console.error('Failed to save candidate:', error);
  }
};

const handleDelete = async (candidateId: string) => {
  try {
    await candidateService.delete(candidateId);
    // Refresh list
    await loadCandidates();
  } catch (error) {
    console.error('Failed to delete candidate:', error);
  }
};
```

## 🗄️ Database Schema

All tables are defined in:
- **SQL**: `/src/database.sql` (run in Supabase SQL Editor)

**Database**: Supabase (PostgreSQL)
- **Project ID**: `pwcmyidxdyetvyiuosnm`
- **Setup Guide**: See `backend/SUPABASE_SETUP.md`

### Key Tables
- `users` - User accounts
- `countries` - Countries
- `elections` - Elections
- `candidates` - Candidates
- `votes` - User votes
- `news` - News articles
- `news_tags` - News tags
- `news_hashtags` - News hashtags
- `comments` - Comments
- `comment_likes` - Comment likes
- `comment_reactions` - Comment reactions
- `chat_rooms` - Chat rooms
- `chat_messages` - Chat messages
- `chat_moderators` - Chat moderators
- `platform_settings` - Platform settings

## ✅ Testing Checklist

- [ ] Backend server starts successfully
- [ ] Database connection works
- [ ] All API endpoints respond correctly
- [ ] Authentication works
- [ ] Admin endpoints require admin role
- [ ] Frontend services can connect to API
- [ ] CRUD operations work in admin pages
- [ ] Error handling works properly

## 📚 Next Steps

1. **Update Context Providers**: Modify contexts to use API services instead of mock data
2. **Add Error Handling**: Implement proper error handling in components
3. **Add Loading States**: Show loading indicators during API calls
4. **Add Toast Notifications**: Show success/error messages
5. **Add Form Validation**: Validate forms before submission
6. **Add Pagination**: For large data sets
7. **Add Search/Filter**: Enhanced filtering capabilities

## 🔗 Related Files

- Backend API: `/backend/src/routes/`
- Frontend Services: `/src/services/`
- Database Schema: `/src/database.sql` and `/backend/src/database/schema.ts`
- Admin Pages: `/src/pages/admin/`
- Context Providers: `/src/context/`

