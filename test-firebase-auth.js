// test-firebase-auth.js
import { registerWithEmailPassword, signInWithGoogle } from './authService.js';
import 'dotenv/config';

// Test user data
const testUser = {
  username: "testuser" + Math.floor(Math.random() * 1000), // Random username to avoid conflicts
  email: "testuser" + Math.floor(Math.random() * 1000) + "@example.com",
  password: "Test123!",
  firstName: "Test",
  lastName: "User",
  zipCode: "10001"
};

console.log("Testing Firebase authentication with user:", testUser);

async function runTest() {
  try {
    console.log("1. Registering a new user with Firebase...");
    const firebaseUser = await registerWithEmailPassword(testUser);
    console.log("Registration successful! Firebase UID:", firebaseUser.uid);
    
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
    if (error.code) console.error("Firebase error code:", error.code);
  }
}

runTest();
