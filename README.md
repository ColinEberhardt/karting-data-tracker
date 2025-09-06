# 🏎️ Tyre Management MVP (SvelteKit + Firebase)

A simple, secure, multi-user web application for tracking go-kart tyres. Users can log tyres with brand and description details, with authentication-based access control.

## ✨ Features

- **Authentication**: Email/password and Google login via Firebase Auth
- **Tyre Management**: Create, read, update, and delete tyre entries
- **User Security**: Users can only access their own tyre data
- **Responsive Design**: Mobile-friendly interface
- **Real-time Database**: Cloud Firestore for data persistence

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+ or 24+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd karting-firebase
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database
4. Get your Firebase config from Project Settings

### 3. Configure Firebase

Update `src/lib/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Deploy Security Rules

```bash
firebase login
firebase use --add  # Select your project
firebase deploy --only firestore:rules
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔐 Security Rules

The Firestore security rules ensure:
- Users can only read/write their own tyre data
- All operations require authentication

## 📁 Project Structure

```
src/
├── lib/
│   ├── firebase.js      # Firebase configuration
│   ├── stores.js        # Svelte stores for user state
│   ├── tyres.js         # Firestore CRUD operations
│   └── Navigation.svelte # Navigation component
├── routes/
│   ├── Login.svelte     # Authentication page
│   ├── Dashboard.svelte # User's tyres dashboard
│   ├── NewTyre.svelte   # Add new tyre form
│   └── EditTyre.svelte  # Edit tyre form
└── App.svelte           # Main app with routing
```

## 🚀 Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Other Platforms

The built files in `dist/` can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Firebase Commands

- `firebase serve` - Serve locally with Firebase functions
- `firebase deploy` - Deploy to Firebase
- `firebase deploy --only firestore:rules` - Deploy security rules only
- `firebase deploy --only hosting` - Deploy hosting only

## 📋 MVP Checklist

- ✅ Login/signup (email or Google)
- ✅ Create new tyre
- ✅ View user's tyres
- ✅ Edit/delete tyre
- ✅ Data security per user
- ✅ Deployment ready (Firebase Hosting)

## 🔧 Configuration

### Environment Variables

For production, consider using environment variables for Firebase config:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... other config
};
```

### Customization

- Update colors and styling in component `<style>` sections
- Modify tyre schema in `src/lib/tyres.js`
- Add more fields to the tyre form components

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
