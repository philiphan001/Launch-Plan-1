// schema.js
// Re-export the shared schema to maintain compatibility across the application

// Import and re-export everything from the main schema file
export * from "./shared/schema.js";

// This ensures that any imports from ./schema.js will get the proper schema
// from the shared/schema.js file, avoiding schema conflicts and SQL errors.
