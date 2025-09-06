# 🛠️ Technical Specification: Tyre Management MVP (Firebase + SvelteKit)

This is the specification that was used as the 'seed' for the application, created via this chat: https://chatgpt.com/share/e/68bc1ad0-093c-8012-a613-1e1bb6315f7a

## 🎯 Goal

Build a simple, secure, multi-user web app where users can **l| Feature                        | Included     |
| ------------------------------ | ------------ |
| Login/signup (email or Google) | ✅            |
| Create new tyre                | ✅            |
| View user's tyres              | ✅            |
| Edit/delete tyre               | ✅            |
| Data security per user         | ✅            |
| Deployment (Firebase Hosting)  | ✅ (optional) |t tyres** with:

* `brand` (string)
* `description` (string)

Users must authenticate (email/password or Google), and can only access their own tyre data.

---

## 🧑‍💻 Frontend: SvelteKit + Firebase

### Libraries / Tools

* `SvelteKit`
* `firebase` (JS SDK)
* `firebaseui` for drop-in auth UI
* simple CSS styling

### Pages / Routes

| Path           | Purpose                            |
| -------------- | ---------------------------------- |
| `/login`       | Sign in with Google or email       |
| `/tyres`       | View user's tyres                  |
| `/tyres/new`   | Create new tyre entry              |
| `/tyres/:id`   | Edit or delete tyre                |

---

## ☁️ Backend: Firebase Services

### ✅ 1. Authentication

**Firebase Auth** supports:

* Email/password login
* Google login (other providers optional)
* Hosted UI via FirebaseUI
* Email verification and password reset

---

### ✅ 2. Database

**Cloud Firestore** (NoSQL document store)

#### Tyre Document Schema

```json
{
  "userId": "uid-from-auth",
  "brand": "Bridgestone",
  "description": "Used on wet track at Rowrah",
  "createdAt": <timestamp>
}
```

#### Collection

```
tyres/
  tyreId_1
  tyreId_2
  ...
```

#### Querying

* Users only fetch documents where `userId == currentUser.uid`

---

### ✅ 3. Security Rules

Firestore security rules to enforce access:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tyres/{tyreId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 📦 Firebase Project Configuration

Use the Firebase Console to:

* Create a new project
* Enable Firestore (production or test mode initially)
* Enable Authentication (Email/Password, Google)
* Add your app (Web) and copy config for use in frontend

---

## 🔐 Example Auth Flow (Frontend)

```js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = { /* your config here */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google sign-in
const provider = new GoogleAuthProvider();
signInWithPopup(auth, provider)
  .then(result => console.log("Logged in:", result.user.email))
  .catch(console.error);
```

---

## ✏️ Example Firestore CRUD (Frontend)

```js
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

const addTyre = async (brand, description) => {
  await addDoc(collection(db, "tyres"), {
    userId: auth.currentUser.uid,
    brand,
    description,
    createdAt: new Date()
  });
};
```

---

## ✅ MVP Feature Checklist

| Feature                        | Included     |
| ------------------------------ | ------------ |
| Login/signup (email or Google) | ✅            |
| Create new tyre                | ✅            |
| View user’s tyres              | ✅            |
| Edit/delete tyre               | ✅            |
| Admin view of all tyres        | ✅            |
| Data security per user         | ✅            |
| Deployment (Firebase Hosting)  | ✅ (optional) |

---
