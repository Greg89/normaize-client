# Normaize Frontend

A React application built with Vite, TypeScript, and Tailwind CSS.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- React Router for navigation
- Chart.js for data visualization
- File upload capabilities with react-dropzone
- Modern UI components with Headless UI and Heroicons

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment to Railway

This project is configured for deployment on Railway. The `railway.toml` file contains the necessary configuration.

### Environment Variables for Railway

Set these environment variables in your Railway project:

- `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)
- `NODE_ENV`: Set to `production`

### Deployment Steps

1. Connect your GitHub repository to Railway
2. Set the environment variables in Railway dashboard
3. Railway will automatically build and deploy your app

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services and utilities
├── App.tsx        # Main app component
├── main.tsx       # App entry point
└── index.css      # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm start` - Start production server (for Railway)

## Dependencies

### Core
- React 18
- React Router DOM
- TypeScript
- Vite

### UI & Styling
- Tailwind CSS
- Headless UI
- Heroicons
- Lucide React

### Data & Charts
- Chart.js
- React Chart.js 2

### Utilities
- Axios for API calls
- React Dropzone for file uploads
- React Hot Toast for notifications
- Clsx for conditional classes 