// userService.js
import { db } from "./db"; // Your existing Drizzle DB connection
import { eq } from "drizzle-orm";
import { users } from "./shared/schema.js"; // Update this import to use your shared schema
import bcrypt from "bcrypt";

// Sync Firebase user with your database
export const syncUserWithDatabase = async (firebaseUser) => {
  if (!firebaseUser) return null;

  const { uid, email, displayName, photoURL } = firebaseUser;

  // Check if user exists in your database - use firebaseUid column
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.firebaseUid, uid));
  const userExists = existingUsers.length > 0;

  if (userExists) {
    // Update existing user
    await db
      .update(users)
      .set({
        email,
        firstName: displayName?.split(" ")[0] || "",
        lastName: displayName?.split(" ").slice(1).join(" ") || "",
        photoURL,
        lastLoginAt: new Date(),
      })
      .where(eq(users.firebaseUid, uid));

    return existingUsers[0];
  } else {
    // Create new user with the correct schema
    const newUser = await db
      .insert(users)
      .values({
        firebaseUid: uid,
        username: email || `user_${uid.substring(0, 8)}`,
        email,
        firstName: displayName?.split(" ")[0] || "",
        lastName: displayName?.split(" ").slice(1).join(" ") || "",
        photoURL,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      })
      .returning();

    return newUser[0];
  }
};

// Create a new user
export const createUser = async (userData) => {
  // Check if username exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, userData.username))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Username already exists");
  }

  // Hash password if provided
  let userToCreate = { ...userData };

  // Handle password correctly - always ensure we're saving to passwordHash, not password
  if (userData.password) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    // Replace password with passwordHash
    userToCreate.passwordHash = passwordHash;
    // Remove the password field to avoid insertion error
    delete userToCreate.password;
  }

  // Double-check to make sure password is deleted
  delete userToCreate.password;

  // Ensure timestamps are set
  if (!userToCreate.createdAt) {
    userToCreate.createdAt = new Date();
  }

  // Create user with proper fields
  try {
    // Make sure we're only inserting valid fields from the schema and not passing any 'password' field
    const validUserData = {
      username: userToCreate.username,
      passwordHash: userToCreate.passwordHash,
      firstName: userToCreate.firstName,
      lastName: userToCreate.lastName,
      email: userToCreate.email,
      location: userToCreate.location,
      zipCode: userToCreate.zipCode,
      birthYear: userToCreate.birthYear,
      onboardingCompleted: userToCreate.onboardingCompleted,
      createdAt: userToCreate.createdAt,
    };

    const newUser = await db.insert(users).values(validUserData).returning();

    return newUser[0];
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

// Get user by Firebase UID
export const getUserByFirebaseUid = async (firebaseUid) => {
  if (!firebaseUid) return null;

  const foundUsers = await db
    .select()
    .from(users)
    .where(eq(users.firebaseUid, firebaseUid));
  return foundUsers[0] || null;
};

// Get user by ID
export const getUserById = async (userId) => {
  if (!userId) return null;

  const foundUsers = await db.select().from(users).where(eq(users.id, userId));
  return foundUsers[0] || null;
};
