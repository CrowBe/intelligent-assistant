# Intelligent Assistant

AI-powered administrative assistant for Australian trade businesses. A single-screen chat interface with MCP (Model Context Protocol) agent integration for Gmail, Calendar, and document processing.

## Developer Setup Guide

This setup guide enables any developer to clone the repo and resume development from the current Phase 1 state.

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- VS Code (recommended)

### Quick Setup

1. **Clone repository:**
   ```bash
   git clone <repo-url>
   cd intelligent-admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy environment template
   cp frontend/.env.example frontend/.env
   ```

4. **Set up authentication services:**
   
   **a) Kinde Authentication Setup:**
   - Go to [Kinde.com](https://kinde.com) and create account
   - Create new project: "Intelligent Assistant"
   - Add to `frontend/.env`:
     ```
     VITE_KINDE_CLIENT_ID=your-kinde-client-id
     VITE_KINDE_DOMAIN=https://yourdomain.kinde.com
     VITE_KINDE_REDIRECT_URI=http://localhost:5173
     VITE_KINDE_LOGOUT_URI=http://localhost:5173
     ```

   **b) Firebase + Gmail API Setup:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create project: "intelligent-admin"
   - Enable Gmail API in Google Cloud Console
   - Create OAuth 2.0 credentials for web application
   - Add authorized origins: `http://localhost:5173`
   - Add to `frontend/.env`:
     ```
     VITE_FIREBASE_API_KEY=your-firebase-api-key
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_APP_ID=your-app-id
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
     ```

5. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend  
   cd frontend && npm run dev
   ```

6. **Verify setup:**
   - Open http://localhost:5173
   - Go to "Development Setup" tab
   - All checks should show green ✅
   - Test Gmail integration in chat interface

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Development Setup**: http://localhost:5173 (Setup tab)

## Development Workflow

### VS Code Extensions
The workspace will prompt you to install recommended extensions including:
- GitHub Copilot & Copilot Chat
- TypeScript, ESLint, Prettier
- Prisma, Docker, GitLens

### AI Assistant Instructions
- **Copilot Instructions**: `.github/COPILOT_INSTRUCTIONS.md`
- **Development Context**: `.ai/development-context.md`

### Key Commands
```bash
npm run dev          # Start both frontend and backend
npm run test         # Run all tests
npm run lint         # Run linting
npm run type-check   # Run TypeScript checks
npm run build        # Build for production
```

## Architecture

### Simplified Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Prisma ORM + SQLite/PostgreSQL
- **AI**: OpenAI API integration
- **Real-time**: Server-Sent Events
- **MCP Agents**: Gmail, Calendar, Document processing

### Project Structure
```
├── frontend/          # React single-page application
├── backend/           # Express.js API server
├── shared/            # Shared types and utilities
├── docs/              # Documentation
├── .vscode/           # VS Code configuration
└── scripts/           # Development scripts
```

## Current Phase: Phase 1B - Email Intelligence (In Progress)

### Completed (Phase 1A - Foundation)
- ✅ Project structure setup with monorepo
- ✅ VS Code configuration and workspace
- ✅ Package.json and dependencies
- ✅ Basic React chat interface
- ✅ Express.js server with routes
- ✅ Authentication (Kinde + Google OAuth hybrid)
- ✅ Gmail API integration with modern Google Identity Services
- ✅ Email analysis engine with AI-powered categorization
- ✅ Morning digest generation with business insights

### Current Development (Phase 1B)
- ✅ Gmail OAuth integration working end-to-end
- ✅ Email fetching and analysis services built
- ✅ UI cleaned up to focus on core features
- 🔄 Building email intelligence UI components
- 🔄 User preference storage for email settings

### Next Steps
1. Build Email Intelligence dashboard UI
2. Create Morning Digest viewer component
3. Add email categorization interface
4. Implement user preferences for email analysis

## Business Context

**Target Market**: Australian trade businesses (plumbing, electrical, HVAC) with 1-50 employees
**Problem**: Administrative burden prevents scaling (AU$56B wasted annually on admin tasks)
**Solution**: AI chat interface replacing 5-8 separate business applications

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint + Prettier enforcement
- Functional React components with hooks
- Proper error handling with custom error classes

### MCP Agent Pattern
```typescript
interface MCPAgent {
  name: string;
  capabilities: string[];
  execute(task: AgentTask): Promise<AgentResult>;
  healthCheck(): Promise<boolean>;
}
```

### Testing
- Unit tests for all services
- Component tests for React components
- Integration tests for MCP agents
- E2E tests for critical flows

## Troubleshooting

### Common Issues
- **Port conflicts**: Check if ports 3000, 5173 are available
- **Database issues**: Run `npm run db:reset` in backend/
- **Docker issues**: Run `docker-compose down -v && docker-compose up -d`

### Getting Help
- Check VS Code Problems panel for TypeScript/ESLint issues
- Use Copilot Chat for coding assistance
- Review `.ai/development-context.md` for project context

## Environment Variables Reference

### Required for Development
```bash
# Kinde Authentication
VITE_KINDE_CLIENT_ID=your-kinde-client-id
VITE_KINDE_DOMAIN=https://yourdomain.kinde.com
VITE_KINDE_REDIRECT_URI=http://localhost:5173
VITE_KINDE_LOGOUT_URI=http://localhost:5173

# Firebase Configuration  
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# Google OAuth for Gmail API
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_WEBSOCKET_URL=ws://localhost:3000
```

### Optional Configuration
```bash
# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_API=false

# UI Configuration  
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

---

Built with ❤️ for Australian trade businesses