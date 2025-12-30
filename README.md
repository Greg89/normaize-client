# Normaize Frontend

[![CI/CD Pipeline](https://github.com/Greg89/normaize-client/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/Greg89/normaize-client/actions/workflows/ci.yml)
[![PR Checks](https://github.com/Greg89/normaize-client/workflows/Pull%20Request%20Checks/badge.svg)](https://github.com/Greg89/normaize-client/actions/workflows/pr-check.yml)
[![Code Quality](https://img.shields.io/badge/code%20quality-A%2B-brightgreen)](https://github.com/Greg89/normaize-client)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-purple)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/Greg89/normaize-client/blob/main/LICENSE)

A production-ready React application built with Vite, TypeScript, and Tailwind CSS for data analysis and visualization. Features comprehensive error handling, logging, and monitoring capabilities.

This client is designed to work with the Normaize API (see the `normaize-server` workspace folder). The UI expects Auth0 for authentication and consumes the dataset/analysis endpoints exposed by the server.

## 📊 Status Badges

| Badge | Description | Status |
|-------|-------------|--------|
| **CI/CD Pipeline** | Automated build, test, and deployment pipeline | ![CI/CD Pipeline](https://github.com/Greg89/normaize-client/workflows/CI/CD%20Pipeline/badge.svg) |
| **PR Checks** | Code quality checks on pull requests | ![PR Checks](https://github.com/Greg89/normaize-client/workflows/Pull%20Request%20Checks/badge.svg) |
| **Code Quality** | ESLint, TypeScript, and security checks | ![Code Quality](https://img.shields.io/badge/code%20quality-A%2B-brightgreen) |
| **TypeScript** | TypeScript version and type safety | ![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue) |
| **React** | React version and compatibility | ![React](https://img.shields.io/badge/React-18.2-blue) |
| **Vite** | Build tool and development server | ![Vite](https://img.shields.io/badge/Vite-7.0-purple) |
| **License** | Project license information | ![License](https://img.shields.io/badge/license-MIT-green) |

## 🚀 Features

- **Modern React 18** with TypeScript for type safety
- **Vite 7** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system
- **React Router** for client-side navigation
- **Chart.js** for data visualization
- **Auth0 Integration** for secure authentication
- **File upload** capabilities with validation
- **Error boundaries** and comprehensive error handling
- **Centralized logging** with Seq integration
- **Performance monitoring** and error tracking
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
   Copy the example environment file and configure it:
   ```bash
   cp env.example .env
   ```
   
   Configure the following required variables:
   ```env
   # Auth0 Configuration (Required)
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=your-api-identifier
   
   # API Configuration
   # Local API (default dev URL for the server)
   VITE_API_URL=http://localhost:5001
   
   # Optional: Logging and Monitoring
   VITE_SEQ_URL=https://your-seq-instance.railway.app
   VITE_SEQ_API_KEY=your-seq-api-key
   VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## ✅ Build & CI Notes

- `npm run build` runs `tsc` in strict mode before bundling with Vite.
- ESLint is configured to fail CI on unused disables and warnings (`--report-unused-disable-directives --max-warnings 0`).

Common checks:

```bash
npm run lint
npm run test --silent
npm run build
```

## 🔎 Dataset Preview Behavior

- The UI calls `GET /api/datasets/{id}/preview` and renders a small table preview.
- The server supports a `rows` query param (default 10, max 100).
- The preview payload contains `columns` and `rows` (rows are objects/dictionaries keyed by column name). The client parsing is resilient to both camelCase and PascalCase payloads.

## 🗓️ Retention Date Behavior

- Retention is treated as a *date-only* value in the UI.
- If the API returns an ISO datetime (e.g. `2026-01-01T00:00:00Z`), the UI displays it as `YYYY-MM-DD` (no timezone shifting).

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

- `VITE_AUTH0_DOMAIN`: Your Auth0 domain
- `VITE_AUTH0_CLIENT_ID`: Your Auth0 client ID
- `VITE_AUTH0_AUDIENCE`: Your Auth0 API identifier
- `VITE_API_URL`: Your backend API URL
- `VITE_SEQ_URL`: Your Seq logging instance URL (optional)
- `VITE_SEQ_API_KEY`: Your Seq API key (optional)
- `VITE_SENTRY_DSN`: Your Sentry DSN for error tracking (optional)

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
│   ├── Auth0Provider.tsx      # Auth0 authentication wrapper
│   ├── ErrorBoundary.tsx      # Error boundary components
│   ├── ErrorBoundaryWithLogging.tsx
│   ├── Layout.tsx             # Main layout component
│   ├── LoadingSpinner.tsx
│   └── SessionPersistence.tsx # Session management
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── DataSets.tsx
│   ├── Analysis.tsx
│   ├── Visualization.tsx
│   └── AccountSettings.tsx    # User profile and settings
├── services/           # API services
│   └── api.ts
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── utils/              # Utility functions
│   ├── auth0-config.ts # Auth0 configuration
│   ├── config.ts       # App configuration management
│   ├── errorHandling.ts # Error handling utilities
│   ├── globalErrorHandlers.ts # Global error handlers
│   ├── logger.ts       # Centralized logging
│   ├── sentry.ts       # Sentry error tracking
│   └── performanceMonitor.ts # Performance monitoring
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Building
- `npm run build` - Build for production
- `npm run build:staging` - Build for staging environment
- `npm run build:production` - Build for production environment
- `npm run build:analyze` - Build with bundle analysis
- `npm run preview` - Preview production build
- `npm run preview:staging` - Preview staging build
- `npm run preview:production` - Preview production build

### Testing
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ci` - Run tests for CI environment
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI

### Utilities
- `npm run clean` - Clean build artifacts
- `npm run security:audit` - Run security audit
- `npm run security:fix` - Fix security vulnerabilities
- `npm run bundle:analyze` - Analyze bundle size

## 🛡️ Production Features

### Authentication & Security
- **Auth0 Integration** for secure user authentication
- **Token validation** and automatic refresh
- **Session persistence** across browser sessions
- **Protected routes** and role-based access control

### Error Handling
- **Error Boundaries** catch React errors gracefully
- **Centralized error handling** with user-friendly messages
- **Toast notifications** for user feedback
- **Comprehensive logging** with Seq integration
- **Sentry integration** for error tracking and monitoring

### Performance
- **Code splitting** with React Router
- **Optimized builds** with Vite 7
- **Manual chunk splitting** for better caching
- **Performance monitoring** and metrics collection
- **Minified and compressed** assets

### Logging & Monitoring
- **Centralized logging** system with Seq integration
- **Performance monitoring** and metrics
- **Error tracking** with Sentry
- **User action tracking** for analytics
- **Correlation IDs** for request tracing

### Security
- **Environment variable** validation
- **Input validation** for file uploads
- **CORS configuration** for API calls
- **Content Security Policy** ready
- **Secure authentication** with Auth0

### Accessibility
- **Semantic HTML** structure
- **Keyboard navigation** support
- **Screen reader** friendly
- **ARIA labels** and roles

## 📦 Dependencies

### Core
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **TypeScript 4.9** - Type safety
- **Vite 7** - Build tool and dev server

### Authentication
- **@auth0/auth0-react** - Auth0 React integration

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
- **Axios** - HTTP client

### Monitoring & Logging
- **@sentry/react** - Error tracking and monitoring
- **@sentry/tracing** - Performance monitoring

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with production optimizations
- `tsconfig.json` - TypeScript configuration with strict type checking
- `tsconfig.node.json` - TypeScript configuration for Node.js files
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `jest.config.js` - Jest testing configuration
- `railway.toml` - Railway deployment configuration
- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier code formatting configuration
- `.gitignore` - Git ignore rules
- `.npmrc` - npm configuration

## 🧪 Testing

The project is set up for comprehensive testing:

- **Jest** for unit and integration tests
- **React Testing Library** for component testing
- **Playwright** for end-to-end testing
- **ESLint** for code quality
- **TypeScript** for type checking
- **Error boundaries** for runtime error handling

## 📈 Performance Monitoring

Integrated monitoring and analytics:

- **Sentry** for error tracking and performance monitoring
- **Seq** for centralized logging and correlation
- **Performance monitoring** utilities
- **Bundle analysis** tools
- **Web Vitals** monitoring ready

## 🔒 Security Considerations

- **Auth0** for secure authentication
- **Environment variables** for sensitive data
- **Input validation** and sanitization
- **CORS configuration** for API calls
- **Content Security Policy** ready
- **Token validation** and refresh
- **Session security** management

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚨 Recent Fixes

### TypeScript Type Checking
- Fixed all TypeScript compilation errors
- Added proper `override` modifiers for React components
- Resolved `exactOptionalPropertyTypes` compatibility issues
- Fixed environment variable access patterns
- Cleaned up duplicate configuration options

### Build System
- Fixed Vite configuration for ESM compatibility
- Replaced `require()` statements with ES module imports
- Resolved PostCSS plugin configuration issues
- Optimized TypeScript compilation settings

### Error Handling
- Enhanced error boundary components
- Improved global error handling
- Added comprehensive logging integration
- Fixed error type safety issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Run type checking: `npm run type-check`
6. Run linting: `npm run lint`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 