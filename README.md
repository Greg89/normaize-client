# Normaize Frontend

[![CI/CD Pipeline](https://github.com/Greg89/normaize-client/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/Greg89/normaize-client/actions/workflows/ci.yml)
[![PR Checks](https://github.com/Greg89/normaize-client/workflows/Pull%20Request%20Checks/badge.svg)](https://github.com/Greg89/normaize-client/actions/workflows/pr-check.yml)
[![Code Quality](https://img.shields.io/badge/code%20quality-A%2B-brightgreen)](https://github.com/Greg89/normaize-client)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-purple)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/Greg89/normaize-client/blob/main/LICENSE)

A production-ready React application built with Vite, TypeScript, and Tailwind CSS for data analysis and visualization.

## 📊 Status Badges

| Badge | Description | Status |
|-------|-------------|--------|
| **CI/CD Pipeline** | Automated build, test, and deployment pipeline | ![CI/CD Pipeline](https://github.com/Greg89/normaize-client/workflows/CI/CD%20Pipeline/badge.svg) |
| **PR Checks** | Code quality checks on pull requests | ![PR Checks](https://github.com/Greg89/normaize-client/workflows/Pull%20Request%20Checks/badge.svg) |
| **Code Quality** | ESLint, TypeScript, and security checks | ![Code Quality](https://img.shields.io/badge/code%20quality-A%2B-brightgreen) |
| **TypeScript** | TypeScript version and type safety | ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) |
| **React** | React version and compatibility | ![React](https://img.shields.io/badge/React-18.2-blue) |
| **Vite** | Build tool and development server | ![Vite](https://img.shields.io/badge/Vite-7.0-purple) |
| **License** | Project license information | ![License](https://img.shields.io/badge/license-MIT-green) |

## 🚀 Features

- **Modern React 18** with TypeScript for type safety
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system
- **React Router** for client-side navigation
- **Chart.js** for data visualization
- **File upload** capabilities with validation
- **Error boundaries** and comprehensive error handling
- **Loading states** and user feedback
- **Responsive design** for all devices
- **Production optimizations** and best practices

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd normaize-client
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

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🚀 Deployment

### Railway Deployment

This project is configured for deployment on Railway with the `railway.toml` file.

#### Environment Variables for Railway

Set these in your Railway project dashboard:

- `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app`)
- `NODE_ENV`: Set to `production`

#### Deployment Steps

1. Connect your GitHub repository to Railway
2. Set the environment variables in Railway dashboard
3. Railway will automatically build and deploy your app

### Other Platforms

The app can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout component
│   ├── LoadingSpinner.tsx
│   └── ErrorBoundary.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── DataSets.tsx
│   ├── Analysis.tsx
│   └── Visualization.tsx
├── services/           # API services
│   └── api.ts
├── hooks/              # Custom React hooks
│   └── useApi.ts
├── utils/              # Utility functions
│   ├── constants.ts
│   └── errorHandling.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm start` - Start production server (for Railway)

## 🛡️ Production Features

### Error Handling
- **Error Boundaries** catch React errors gracefully
- **Centralized error handling** with user-friendly messages
- **Toast notifications** for user feedback
- **Comprehensive logging** for debugging

### Performance
- **Code splitting** with React Router
- **Optimized builds** with Vite
- **Lazy loading** ready for future implementation
- **Minified and compressed** assets

### Security
- **Environment variable** validation
- **Input validation** for file uploads
- **CORS configuration** for API calls
- **Content Security Policy** ready

### Accessibility
- **Semantic HTML** structure
- **Keyboard navigation** support
- **Screen reader** friendly
- **ARIA labels** and roles

## 📦 Dependencies

### Core
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library
- **Lucide React** - Additional icons

### Data & Charts
- **Chart.js** - Charting library
- **React Chart.js 2** - React wrapper for Chart.js

### Utilities
- **React Hot Toast** - Toast notifications
- **Clsx** - Conditional class names

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with production optimizations
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `railway.toml` - Railway deployment configuration
- `.gitignore` - Git ignore rules
- `.npmrc` - npm configuration

## 🧪 Testing

The project is set up for testing with:
- **ESLint** for code quality
- **TypeScript** for type checking
- **Error boundaries** for runtime error handling

## 📈 Performance Monitoring

Ready for integration with:
- **Google Analytics**
- **Sentry** for error tracking
- **Web Vitals** monitoring

## 🔒 Security Considerations

- Environment variables for sensitive data
- Input validation and sanitization
- CORS configuration
- Content Security Policy ready

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 