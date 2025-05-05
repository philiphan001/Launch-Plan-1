#!/usr/bin/env node

import "../server/db-config.js";
import { testConnection } from "../server/db-config.js";

// Test database connection
console.log("Testing connection to AWS RDS...");

testConnection()
  .then((success) => {
    if (success) {
      console.log("✓ Successfully connected to AWS RDS database");
      process.exit(0);
    } else {
      console.error("✗ Failed to connect to AWS RDS database");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Error during connection test:", error);
    process.exit(1);
  });
