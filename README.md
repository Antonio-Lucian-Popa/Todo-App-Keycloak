# Todo App with Keycloak Authentication

A modern, responsive todo application built with React, TypeScript, and Keycloak authentication. Features Google OAuth integration and a complete user management system.

## Features

### 🔐 Authentication
- **Flexible Authentication**: Support for both Google OAuth and manual login/register
- **Generic Keycloak Integration**: Reusable authentication service that can be used across multiple applications
- **Google OAuth**: Direct integration with Google authentication through Keycloak
- **Manual Authentication**: Custom login and registration forms with username/password
- **Token Management**: Automatic token refresh when access tokens expire
- **User Onboarding**: Collect additional user information after initial authentication

### 📋 Todo Management
- **Full CRUD Operations**: Create, read, update, and delete todos
- **Advanced Filtering**: Filter by category, priority, completion status, and search
- **Priority Levels**: High, medium, and low priority tasks
- **Categories**: Organize tasks by work, personal, shopping, health, etc.
- **Due Dates**: Set and track task deadlines
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🎨 UI/UX
- **Modern Design**: Clean, professional interface using shadcn/ui components
- **Responsive Layout**: Mobile-first design that adapts to all screen sizes
- **Loading States**: Smooth loading indicators and error handling
- **Animations**: Subtle transitions and micro-interactions
- **Toast Notifications**: User feedback for all actions

## Architecture

### Generic Keycloak Service
The application includes a generic Keycloak service (`src/services/keycloak.ts`) that can be reused across different applications:

```typescript
// Key features:
- Automatic token refresh
- Secure token storage
- HTTP interceptors for API calls
- Logout handling
- Error management
```

### Authentication Flow

#### Google OAuth Flow:
1. User clicks "Continue with Google"
2. Redirected to Keycloak with Google provider hint
3. Google OAuth flow completes
4. Authorization code exchanged for tokens
5. User information fetched from Keycloak
6. Optional onboarding for additional information
7. User data sent to Spring Boot backend

#### Manual Authentication Flow:
1. User fills login form with username/password OR registration form
2. Direct authentication with Keycloak using Resource Owner Password Credentials Grant
3. For registration: User created in Keycloak, then automatically logged in
4. Tokens obtained and stored securely
5. User information fetched from Keycloak
6. Optional onboarding for additional information
7. User data sent to Spring Boot backend

### Token Management
- **Access Token**: Stored in HTTP-only cookies with expiration
- **Refresh Token**: Automatically used to get new access tokens
- **Interceptors**: Automatic token refresh on 401 responses
- **Logout**: Proper cleanup of tokens and Keycloak session

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```env
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=todo-app
REACT_APP_KEYCLOAK_CLIENT_ID=todo-frontend
REACT_APP_REDIRECT_URI=http://localhost:3000
REACT_APP_KEYCLOAK_ADMIN_SECRET=your-admin-client-secret
REACT_APP_API_URL=http://localhost:8081/api
```

### 2. Keycloak Configuration

#### Basic Setup:
1. Create a new realm: `todo-app`
2. Create a new client: `todo-frontend`
3. Configure client settings:
   - Client Protocol: `openid-connect`
   - Access Type: `public` (for frontend client)
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`
   - Direct Access Grants Enabled: `ON` (for manual login)

#### Google OAuth Setup:
1. Configure Google Identity Provider:
   - Add Google identity provider in Keycloak
   - Configure Google OAuth credentials
   - Set the provider alias as `google`

#### Manual Authentication Setup:
1. Enable Direct Access Grants for the client
2. Create an admin client for user registration (optional, can be handled by backend):
   - Client ID: `admin-cli`
   - Access Type: `confidential`
   - Service Accounts Enabled: `ON`
   - Add realm management roles to service account

### 3. Spring Boot Backend
Ensure your Spring Boot application is running on `http://localhost:8081` with the following endpoints:

```
GET /api/users/profile - Get user profile
POST /api/users/complete - Complete user profile with additional info
GET /api/todos - Get user's todos
POST /api/todos - Create new todo
PUT /api/todos/{id} - Update todo
DELETE /api/todos/{id} - Delete todo
PATCH /api/todos/{id}/toggle - Toggle todo completion
```

### 4. Run the Application
```bash
npm install
npm start
```

## Project Structure

```
src/
├── components/
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout components
│   ├── todo/               # Todo-related components
│   └── ui/                 # Reusable UI components
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── services/               # API and external service integrations
├── types/                  # TypeScript type definitions
├── config/                 # Configuration files
└── lib/                    # Utility functions
```

## Key Components

### Authentication
- `AuthProvider`: Context provider for authentication state
- `ProtectedRoute`: Route guard for authenticated users
- `LoginPage`: Login interface with Google OAuth
- `UserOnboarding`: Additional user information collection

### Todo Management
- `TodoList`: Main todo list with filtering and search
- `TodoDialog`: Create/edit todo modal
- `useTodos`: Custom hook for todo operations

### Services
- `KeycloakService`: Generic Keycloak integration
- `ApiService`: Backend API integration with automatic token refresh

## Security Features

- **Secure Token Storage**: Tokens stored in HTTP-only cookies
- **Automatic Token Refresh**: Seamless token renewal
- **CSRF Protection**: SameSite cookie configuration
- **Route Protection**: Authentication guards for all routes
- **Flexible Authentication**: Support for both OAuth and traditional login
- **Error Handling**: Proper error boundaries and user feedback
- **Password Security**: Secure password handling through Keycloak

## Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Configure production environment variables**
3. **Deploy to your preferred hosting platform**
4. **Update Keycloak redirect URIs** for production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.