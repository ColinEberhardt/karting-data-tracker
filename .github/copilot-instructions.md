# Copilot Instructions for Karting Firebase Project

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a SvelteKit web application with Firebase integration for managing go-kart tyres. The application includes:

- **Authentication**: Email/password and Google login using Firebase Auth
- **Database**: Cloud Firestore for storing tyre data
- **Security**: User-based access control
- **UI**: Simple, clean interface using Svelte components

## Architecture

- **Frontend**: SvelteKit with Firebase SDK
- **Backend**: Firebase services (Auth, Firestore)
- **Authentication**: Firebase Auth
- **Database**: Firestore with security rules

## Key Features

1. User authentication (email/password and Google)
2. CRUD operations for tyre management
3. User-specific data access
4. Responsive design

## Development Guidelines

- Follow Svelte best practices for component structure
- Use Firebase SDK v9+ modular syntax
- Implement proper error handling for Firebase operations
- Ensure all database operations respect user permissions
- Use TypeScript where beneficial
- Keep components small and focused
- Follow the established routing structure

## Security Considerations

- All database operations must check user authentication
- Firestore security rules enforce data access policies
- Never expose Firebase config secrets in client code
