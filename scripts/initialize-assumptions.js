// Initialize assumptions for a user
import { db } from '../server/db.js';
import { defaultAssumptions, assumptions } from '../shared/schema.js';

async function initializeAssumptions() {
  const userId = 1; // We'll use the demo user

  try {
    console.log(`Initializing assumptions for user ${userId}...`);
    
    // Get existing assumptions for the user
    const existingAssumptions = await db.query.assumptions.findMany({
      where: (assumptions, { eq }) => eq(assumptions.userId, userId),
    });
    
    // Map existing assumptions by key for quick lookup
    const existingAssumptionsByKey = existingAssumptions.reduce((acc, a) => {
      acc[a.key] = a;
      return acc;
    }, {});
    
    // Process each default assumption
    for (const assumption of defaultAssumptions) {
      const existing = existingAssumptionsByKey[assumption.key];
      
      if (existing) {
        console.log(`Assumption ${assumption.key} already exists for user ${userId}, skipping`);
        continue;
      }
      
      // Create new assumption for this user
      await db.insert(assumptions).values({
        ...assumption,
        userId,
      });
      
      console.log(`Created assumption ${assumption.key} for user ${userId}`);
    }
    
    console.log('Assumptions initialization complete.');
    
  } catch (error) {
    console.error('Error initializing assumptions:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
initializeAssumptions();