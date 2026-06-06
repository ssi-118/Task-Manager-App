# Task Manager App

Tasl Flow is a simple MERN-style task manager app with a React frontend and an Express/MongoDB backend.

## Project Structure

- `backend/` - Express backend API
- `frontend/` - React frontend built with Vite

## Requirements

- Node.js
- npm
- MongoDB Atlas or MongoDB connection string

## Setup

### Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in `backend/` with your MongoDB URI:
   ```env
   MONGO_URI=your-mongodb-connection-string
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

4. For development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build:
   ```bash
   npm run preview
   ```

## Environment Variables

### Frontend

- `VITE_API_URL` - base URL of the backend API (for production deployment)

If not provided, the frontend falls back to `http://localhost:5000`.

### Backend

- `MONGO_URI` - MongoDB Atlas connection string

## API Endpoints

- `GET /api/tasks` - list tasks
- `GET /api/tasks/:id` - get a single task
- `POST /api/tasks` - create a task
- `PUT /api/tasks/:id` - update a task
- `DELETE /api/tasks/:id` - delete a task

## Notes

- The backend uses `cors()` to allow requests from the frontend.
- The frontend uses `axios` to call the backend API.
- Use `.gitignore` to keep environment files and `node_modules` out of version control.

## Live Demo
```
https://task-manager-app-lemon-nine.vercel.app/
```