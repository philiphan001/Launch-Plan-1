// Add the retirement contribution rate assumption for users

import { db } from '../server/db.js';
import { assumptions } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function addRetirementContributionRate() {
  const userId = 1; // Demo user ID
  
  try {
    console.log(`Adding retirement contribution rate assumption for user ${userId}...`);
    
    // Check if the assumption already exists
    const existingAssumption = await db.query.assumptions.findFirst({
      where: (assumptions, { eq, and }) => 
        and(
          eq(assumptions.userId, userId),
          eq(assumptions.key, 'retirement-contribution-rate')
        )
    });
    
    if (existingAssumption) {
      console.log('Retirement contribution rate assumption already exists, skipping.');
      process.exit(0);
      return;
    }
    
    // Create the new assumption
    await db.insert(assumptions).values({
      userId,
      category: 'general',
      key: 'retirement-contribution-rate',
      label: 'Retirement Contribution Rate',
      description: 'Percentage of income contributed to retirement accounts annually',
      value: 10.0,
      defaultValue: 10.0,
      minValue: 0.0,
      maxValue: 25.0,
      stepValue: 0.5,
      unit: '%',
      isEnabled: true
    });
    
    console.log('Successfully added retirement contribution rate assumption!');
    
    // Check for retirement growth rate, add it if missing
    const existingGrowthRate = await db.query.assumptions.findFirst({
      where: (assumptions, { eq, and }) => 
        and(
          eq(assumptions.userId, userId),
          eq(assumptions.key, 'retirement-growth-rate')
        )
    });
    
    if (!existingGrowthRate) {
      await db.insert(assumptions).values({
        userId,
        category: 'general',
        key: 'retirement-growth-rate',
        label: 'Retirement Account Growth Rate',
        description: 'Annual investment growth rate for retirement accounts',
        value: 6.0,
        defaultValue: 6.0,
        minValue: 0.0,
        maxValue: 12.0,
        stepValue: 0.25,
        unit: '%',
        isEnabled: true
      });
      
      console.log('Also added retirement growth rate assumption!');
    }
    
  } catch (error) {
    console.error('Error adding retirement contribution rate:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addRetirementContributionRate();