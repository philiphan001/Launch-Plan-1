/**
 * This script updates the career_paths table to add careerId references
 * to the corresponding records in the careers table based on title matching.
 */

import { db } from "../server/db.ts";
import { careerPaths, careers } from "../shared/schema.ts";
import { eq, sql } from "drizzle-orm";

async function updateCareerPathsReferences() {
  try {
    console.log("Starting update of career_paths references...");
    
    // Get all career paths
    const allCareerPaths = await db.select().from(careerPaths);
    console.log(`Found ${allCareerPaths.length} career paths to process`);
    
    // Get all careers for lookup
    const allCareers = await db.select().from(careers);
    console.log(`Found ${allCareers.length} careers to match with`);
    
    // Create a map for easier lookups
    const careersMap = new Map();
    allCareers.forEach(career => {
      // Store by lowercase title for case-insensitive matching
      careersMap.set(career.title.toLowerCase(), career);
      
      // Also store aliases for better matching
      for (let i = 1; i <= 5; i++) {
        const aliasKey = `alias${i}`;
        if (career[aliasKey]) {
          careersMap.set(career[aliasKey].toLowerCase(), career);
        }
      }
    });
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process each career path
    for (const careerPath of allCareerPaths) {
      const careerTitle = careerPath.career_title.toLowerCase();
      
      // Try exact match first
      let matchedCareer = careersMap.get(careerTitle);
      
      // If no exact match, try finding a career that contains this title or vice versa
      if (!matchedCareer) {
        // Find careers where title includes the career path title or vice versa
        for (const [title, career] of careersMap.entries()) {
          if (title.includes(careerTitle) || careerTitle.includes(title)) {
            matchedCareer = career;
            break;
          }
        }
      }
      
      if (matchedCareer) {
        // Update the career path with the matched career ID
        await db.update(careerPaths)
          .set({ careerId: matchedCareer.id })
          .where(eq(careerPaths.id, careerPath.id));
        
        console.log(`Updated career path '${careerPath.career_title}' (ID: ${careerPath.id}) with careerId: ${matchedCareer.id} (${matchedCareer.title})`);
        successCount++;
      } else {
        console.warn(`No matching career found for '${careerPath.career_title}' (ID: ${careerPath.id})`);
        failureCount++;
      }
    }
    
    console.log(`Update completed. Successfully matched: ${successCount}, Failed to match: ${failureCount}`);
  } catch (error) {
    console.error("Error updating career path references:", error);
  }
}

// Run the update function
updateCareerPathsReferences().then(() => {
  console.log("Finished career paths reference update");
  process.exit(0);
}).catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});