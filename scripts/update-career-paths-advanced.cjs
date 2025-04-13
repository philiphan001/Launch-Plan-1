/**
 * This script updates the career_paths table to add careerId references
 * to the corresponding records in the careers table based on title matching.
 * It uses advanced matching techniques to improve matching rates.
 */
const { db } = require('../server/db');
const { careers, careerPaths } = require('../shared/schema');
const { eq } = require('drizzle-orm');

async function updateCareerPathsReferences() {
  try {
    // Get all career paths
    const allCareerPaths = await db.select().from(careerPaths);
    console.log(`Found ${allCareerPaths.length} career paths to process`);

    // Get all careers
    const allCareers = await db.select().from(careers);
    console.log(`Found ${allCareers.length} careers for matching`);

    // Create a map of career titles to career objects for quick lookup
    const careersMap = new Map();
    for (const career of allCareers) {
      careersMap.set(career.title.toLowerCase(), career);
      
      // Add aliases if they exist
      if (career.alias1) careersMap.set(career.alias1.toLowerCase(), career);
      if (career.alias2) careersMap.set(career.alias2.toLowerCase(), career);
      if (career.alias3) careersMap.set(career.alias3.toLowerCase(), career);
    }

    let successCount = 0;
    let failureCount = 0;

    // Process each career path
    for (const careerPath of allCareerPaths) {
      const careerTitle = careerPath.career_title.toLowerCase();
      
      // Try exact match first
      let matchedCareer = careersMap.get(careerTitle);
      
      // If no exact match, try more sophisticated matching
      if (!matchedCareer) {
        // Try 1: Find careers where title includes the career path title or vice versa
        for (const [title, career] of careersMap.entries()) {
          if (title.includes(careerTitle) || careerTitle.includes(title)) {
            matchedCareer = career;
            console.log(`Matched using inclusion: '${careerPath.career_title}' -> '${career.title}'`);
            break;
          }
        }
        
        // Try 2: Try with singular/plural variations
        if (!matchedCareer) {
          // Check if career title ends with 's' and try to match without it
          if (careerTitle.endsWith('s')) {
            const singularTitle = careerTitle.slice(0, -1);
            for (const [title, career] of careersMap.entries()) {
              if (title === singularTitle || title.includes(singularTitle)) {
                matchedCareer = career;
                console.log(`Matched using singular form: '${careerPath.career_title}' -> '${career.title}'`);
                break;
              }
            }
          }
          // Check career title without 's' and try to match with 's'
          else {
            const pluralTitle = careerTitle + 's';
            for (const [title, career] of careersMap.entries()) {
              if (title === pluralTitle || title.includes(pluralTitle)) {
                matchedCareer = career;
                console.log(`Matched using plural form: '${careerPath.career_title}' -> '${career.title}'`);
                break;
              }
            }
          }
        }
        
        // Try 3: Remove common words and try again
        if (!matchedCareer) {
          const commonWords = ['and', 'or', 'the', 'a', 'an', '&'];
          const cleanCareerTitle = careerTitle.split(' ')
            .filter(word => !commonWords.includes(word.toLowerCase()))
            .join(' ');
            
          for (const [title, career] of careersMap.entries()) {
            const cleanTitle = title.split(' ')
              .filter(word => !commonWords.includes(word.toLowerCase()))
              .join(' ');
              
            if (cleanTitle.includes(cleanCareerTitle) || cleanCareerTitle.includes(cleanTitle)) {
              matchedCareer = career;
              console.log(`Matched using cleaned title: '${careerPath.career_title}' -> '${career.title}'`);
              break;
            }
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
    console.log(`Success rate: ${(successCount / allCareerPaths.length * 100).toFixed(2)}%`);
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