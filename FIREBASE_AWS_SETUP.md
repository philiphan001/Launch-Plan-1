# Firebase Authentication and AWS RDS Integration Guide

This guide provides step-by-step instructions for integrating Firebase Authentication with your AWS RDS PostgreSQL database.

## Prerequisites

1. A Firebase project with Authentication enabled
2. An AWS RDS PostgreSQL database instance
3. The RDS CA certificate (`rds-ca-2019-root.pem`) for SSL connection (included in this repo)
4. Node.js 14+ and npm installed

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file at the root of your project based on the provided `.env.template`:

```bash
# Copy the template file
cp .env.template .env

# Edit the file with your configuration
nano .env
```

Fill in all the required environment variables:

- `DATABASE_URL`: Your AWS RDS connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Individual AWS RDS connection parameters
- `DB_SSL`: Set to `true` to enable SSL for the RDS connection
- Firebase variables: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc.
- Firebase Admin credentials: Either `GOOGLE_APPLICATION_CREDENTIALS` (path to service account file) or individual credentials

### 2. Database Migration

Run the Firebase authentication migration script to add required columns to your users table:

```bash
./scripts/migrate-firebase-auth.js
```

This will add the following columns to your `users` table:

- `firebase_uid` (VARCHAR): The Firebase user ID
- `email_verified` (BOOLEAN): Whether the user's email is verified
- `auth_provider` (VARCHAR): The authentication provider (e.g., password, google)
- `last_login_at` (TIMESTAMP): When the user last logged in

### 3. Testing the Integration

Run the test script to verify that Firebase Authentication and AWS RDS are properly connected:

```bash
./scripts/test-integrations.js
```

This will test:

1. Connection to your AWS RDS database
2. Firebase Admin SDK initialization
3. Basic Firebase Auth operations

### 4. Using Firebase Authentication in Your Application

#### Server-side (Node.js)

The server is already set up with Firebase Authentication middleware. Protected routes use the `firebaseAuth` middleware:

```javascript
// Example of a protected route
app.get("/api/protected/user-data", firebaseAuth, (req, res) => {
  // req.user contains the authenticated user information
  res.json({ user: req.user });
});
```

#### Client-side (React)

The React application is set up with a Firebase Authentication context. Use the `useFirebaseAuth` hook to access authentication functions:

```jsx
import { useFirebaseAuth } from './context/FirebaseAuthContext';

function LoginComponent() {
  const {
    currentUser,
    loginWithEmail,
    loginWithGoogle,
    error
  } = useFirebaseAuth();

  const handleEmailLogin = async (email, password) => {
    try {
      await loginWithEmail(email, password);
      // Redirect or update UI
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      {currentUser ? (
        <p>Welcome, {currentUser.displayName || currentUser.email}</p>
      ) : (
        <form onSubmit={/* your form handling */}>
          {/* Login form fields */}
        </form>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### 5. Authentication Flow

1. User authenticates with Firebase (email/password, Google, etc.)
2. Upon successful authentication:
   - Client receives Firebase token
   - Client sends token to server
   - Server verifies token and creates/updates user in the database
   - Server establishes a session
3. For subsequent requests:
   - Protected API endpoints check for authenticated session
   - Client can use `currentUser` from Firebase context

## Troubleshooting

### Firebase Issues

- **Firebase initialization fails**: Check your Firebase credentials in .env file
- **Token verification errors**: Ensure Firebase project ID matches across client and server
- **CORS issues**: Check that your Firebase project has the correct domains authorized

### AWS RDS Issues

- **Connection timeout**: Check your security group settings to allow traffic from your application
- **SSL certificate errors**: Ensure `rds-ca-2019-root.pem` is in the root directory
- **Access denied**: Verify database username and password

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [AWS RDS PostgreSQL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/auth/admin)
