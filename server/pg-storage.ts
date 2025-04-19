import { db } from './db';
import { 
  users, type User, type InsertUser,
  financialProfiles, type FinancialProfile, type InsertFinancialProfile,
  colleges, type College, type InsertCollege,
  careers, type Career, type InsertCareer,
  favoriteColleges, type FavoriteCollege, type InsertFavoriteCollege,
  favoriteCareers, type FavoriteCareer, type InsertFavoriteCareer,
  favoriteLocations, type FavoriteLocation, type InsertFavoriteLocation,
  financialProjections, type FinancialProjection, type InsertFinancialProjection,
  notificationPreferences, type NotificationPreference, type InsertNotificationPreference,
  milestones, type Milestone, type InsertMilestone,
  careerPaths, type CareerPath, type InsertCareerPath,
  locationCostOfLiving, type LocationCostOfLiving, type InsertLocationCostOfLiving,
  zipCodeIncome, type ZipCodeIncome, type InsertZipCodeIncome,
  collegeCalculations, type CollegeCalculation as DrizzleCollegeCalculation, type InsertCollegeCalculation,
  careerCalculations, type CareerCalculation, type InsertCareerCalculation,
  assumptions, type Assumption, type InsertAssumption, defaultAssumptions,
  InsertPathwayResponse, PathwayResponse, pathwayResponses,
  InsertQuickSpinResponse, QuickSpinResponse
} from "@shared/schema";

// Extended type for college calculations with college data
interface CollegeCalculationWithCollege extends DrizzleCollegeCalculation {
  college?: {
    name: string;
    type?: string;
  };
}

// Use the extended type
type CollegeCalculation = CollegeCalculationWithCollege;
import { IStorage } from './storage';
import { eq, and, or, sql } from 'drizzle-orm';

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }
  
  // Financial profile methods
  async getFinancialProfile(id: number): Promise<FinancialProfile | undefined> {
    const result = await db.select().from(financialProfiles).where(eq(financialProfiles.id, id));
    return result[0];
  }
  
  async getFinancialProfileByUserId(userId: number): Promise<FinancialProfile | undefined> {
    const result = await db.select().from(financialProfiles).where(eq(financialProfiles.userId, userId));
    return result[0];
  }
  
  async createFinancialProfile(profile: InsertFinancialProfile): Promise<FinancialProfile> {
    const result = await db.insert(financialProfiles).values(profile).returning();
    return result[0];
  }
  
  async updateFinancialProfile(id: number, data: Partial<InsertFinancialProfile>): Promise<FinancialProfile | undefined> {
    const result = await db.update(financialProfiles).set(data).where(eq(financialProfiles.id, id)).returning();
    return result[0];
  }
  
  // College methods
  async getCollege(id: number): Promise<College | undefined> {
    const result = await db.select().from(colleges).where(eq(colleges.id, id));
    console.log(`Raw college (ID: ${id}) from database:`, result[0]);
    return result[0];
  }
  
  async getColleges(collegeType?: string): Promise<College[]> {
    let query = db.select().from(colleges);
    
    // Apply filters for college type based on degrees_awarded_predominant field
    if (collegeType) {
      switch(collegeType.toLowerCase()) {
        case 'vocational':
        case 'vocational school':
          query = query.where(eq(colleges.degreesAwardedPredominant, 1));
          break;
        case 'community':
        case 'community college':
          query = query.where(eq(colleges.degreesAwardedPredominant, 2));
          break;
        case 'bachelors':
        case 'bachelor':
        case 'bachelors institution':
          query = query.where(eq(colleges.degreesAwardedPredominant, 3));
          break;
        case 'graduate':
        case 'graduate institution':
          query = query.where(eq(colleges.degreesAwardedPredominant, 4));
          break;
      }
    }
    
    const result = await query;
    console.log(`Retrieved ${result.length} colleges from database${collegeType ? ' with type: ' + collegeType : ''}`);
    if (result.length > 0) {
      console.log(`First college:`, result[0]);
    }
    return result;
  }
  
  async searchColleges(query: string, educationType?: string): Promise<College[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    const lowerQuery = `%${query.toLowerCase()}%`;
    
    let conditions = [
      or(
        sql`LOWER(${colleges.name}) LIKE ${lowerQuery}`,
        sql`LOWER(${colleges.location}) LIKE ${lowerQuery}`
      )
    ];
    
    // Add education type filter if provided
    if (educationType) {
      let typeCondition;
      
      // For education types from the pathways component
      switch (educationType) {
        case '4year':
          typeCondition = or(
            sql`LOWER(${colleges.type}) LIKE '%research%'`,
            sql`LOWER(${colleges.type}) LIKE '%university%'`,
            sql`LOWER(${colleges.type}) LIKE '%4-year%'`,
            sql`LOWER(${colleges.type}) LIKE '%4 year%'`
          );
          break;
        case '2year':
          typeCondition = or(
            // Match on type field
            sql`LOWER(${colleges.type}) LIKE '%community%'`,
            sql`LOWER(${colleges.type}) LIKE '%2-year%'`,
            sql`LOWER(${colleges.type}) LIKE '%2 year%'`,
            sql`LOWER(${colleges.type}) LIKE '%junior%'`,
            // Also match on degreePredominant field (2 = Associate's degree)
            sql`${colleges.degreesAwardedPredominant} = 2`
          );
          break;
        case 'vocational':
          typeCondition = or(
            // Match on type field
            sql`LOWER(${colleges.type}) LIKE '%vocational%'`,
            sql`LOWER(${colleges.type}) LIKE '%technical%'`,
            sql`LOWER(${colleges.type}) LIKE '%trade%'`,
            sql`LOWER(${colleges.type}) LIKE '%career%'`,
            // Also match on degreePredominant field (1 = Certificate programs)
            sql`${colleges.degreesAwardedPredominant} = 1`
          );
          break;
        default:
          // If we don't recognize the education type, don't filter by it
          typeCondition = null;
      }
      
      if (typeCondition) {
        conditions.push(typeCondition);
      }
    }
    
    // Search by name or location, and filter by education type if provided
    const result = await db.select().from(colleges)
      .where(and(...conditions))
      .limit(10);
    
    console.log(`Found ${result.length} colleges matching query "${query}" ${educationType ? `with education type "${educationType}"` : ''}`);
    return result;
  }
  
  async createCollege(college: InsertCollege): Promise<College> {
    const result = await db.insert(colleges).values(college).returning();
    return result[0];
  }
  
  // Career methods
  async getCareer(id: number): Promise<Career | undefined> {
    const result = await db.select().from(careers).where(eq(careers.id, id));
    return result[0];
  }
  
  async getCareers(): Promise<Career[]> {
    return await db.select().from(careers);
  }
  
  async searchCareers(query: string): Promise<Career[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    const searchTerm = `%${query.toLowerCase()}%`;
    
    // Search for careers by title, description, aliases, and category
    return await db.select()
      .from(careers)
      .where(
        or(
          sql`LOWER(${careers.title}) LIKE ${searchTerm}`,
          sql`LOWER(${careers.description}) LIKE ${searchTerm}`,
          sql`LOWER(${careers.category}) LIKE ${searchTerm}`,
          sql`LOWER(${careers.alias1}) LIKE ${searchTerm}`,
          sql`LOWER(${careers.alias2}) LIKE ${searchTerm}`,
          sql`LOWER(${careers.alias3}) LIKE ${searchTerm}`,
          sql`LOWER(${careers.alias4}) LIKE ${searchTerm}`,
          sql`LOWER(${careers.alias5}) LIKE ${searchTerm}`
        )
      )
      .limit(20); // Limit results to avoid too much data
  }
  
  async createCareer(career: InsertCareer): Promise<Career> {
    const result = await db.insert(careers).values(career).returning();
    return result[0];
  }
  
  // Favorite college methods
  async getFavoriteCollege(id: number): Promise<FavoriteCollege | undefined> {
    const result = await db.select().from(favoriteColleges).where(eq(favoriteColleges.id, id));
    return result[0];
  }
  
  async getFavoriteCollegesByUserId(userId: number): Promise<(FavoriteCollege & { college: College })[]> {
    // Join with colleges table to get college details
    const favs = await db.select({
      favorite: favoriteColleges,
      college: colleges
    }).from(favoriteColleges)
      .leftJoin(colleges, eq(favoriteColleges.collegeId, colleges.id))
      .where(eq(favoriteColleges.userId, userId));
      
    // Transform results to match expected return type
    return favs.map(({ favorite, college }) => {
      if (!college) {
        throw new Error(`College not found for favorite ID ${favorite.id}`);
      }
      return { ...favorite, college };
    });
  }
  
  async addFavoriteCollege(userId: number, collegeId: number): Promise<FavoriteCollege> {
    const result = await db.insert(favoriteColleges).values({ userId, collegeId }).returning();
    return result[0];
  }
  
  async removeFavoriteCollege(id: number): Promise<void> {
    await db.delete(favoriteColleges).where(eq(favoriteColleges.id, id));
  }
  
  // Favorite career methods
  async getFavoriteCareer(id: number): Promise<FavoriteCareer | undefined> {
    const result = await db.select().from(favoriteCareers).where(eq(favoriteCareers.id, id));
    return result[0];
  }
  
  async getFavoriteCareersByUserId(userId: number): Promise<(FavoriteCareer & { career: Career })[]> {
    // Join with careers table to get career details
    const favs = await db.select({
      favorite: favoriteCareers,
      career: careers
    }).from(favoriteCareers)
      .leftJoin(careers, eq(favoriteCareers.careerId, careers.id))
      .where(eq(favoriteCareers.userId, userId));
      
    // Transform results to match expected return type
    return favs.map(({ favorite, career }) => {
      if (!career) {
        throw new Error(`Career not found for favorite ID ${favorite.id}`);
      }
      return { ...favorite, career };
    });
  }
  
  async addFavoriteCareer(userId: number, careerId: number): Promise<FavoriteCareer> {
    const result = await db.insert(favoriteCareers).values({ userId, careerId }).returning();
    return result[0];
  }
  
  async removeFavoriteCareer(id: number): Promise<void> {
    await db.delete(favoriteCareers).where(eq(favoriteCareers.id, id));
  }
  
  // Favorite location methods
  async getFavoriteLocation(id: number): Promise<FavoriteLocation | undefined> {
    const result = await db.select().from(favoriteLocations).where(eq(favoriteLocations.id, id));
    return result[0];
  }
  
  async getFavoriteLocationsByUserId(userId: number): Promise<FavoriteLocation[]> {
    // For favorite locations, we just return the raw favorites without joining
    // since the location details are stored in a separate cost of living table
    return await db.select().from(favoriteLocations).where(eq(favoriteLocations.userId, userId));
  }
  
  async getFavoriteLocationByZipCode(userId: number, zipCode: string): Promise<FavoriteLocation | undefined> {
    const result = await db.select().from(favoriteLocations)
      .where(and(
        eq(favoriteLocations.userId, userId),
        eq(favoriteLocations.zipCode, zipCode)
      ));
    return result[0];
  }
  
  async addFavoriteLocation(userId: number, zipCode: string, city?: string, state?: string): Promise<FavoriteLocation> {
    const result = await db.insert(favoriteLocations).values({ 
      userId, 
      zipCode,
      city,
      state 
    }).returning();
    return result[0];
  }
  
  async removeFavoriteLocation(id: number): Promise<void> {
    await db.delete(favoriteLocations).where(eq(favoriteLocations.id, id));
  }
  
  // Financial projection methods
  async getFinancialProjection(id: number): Promise<FinancialProjection | undefined> {
    const result = await db.select().from(financialProjections).where(eq(financialProjections.id, id));
    return result[0];
  }
  
  async getFinancialProjectionsByUserId(userId: number): Promise<FinancialProjection[]> {
    return await db.select().from(financialProjections).where(eq(financialProjections.userId, userId));
  }
  
  async createFinancialProjection(projection: InsertFinancialProjection): Promise<FinancialProjection> {
    const result = await db.insert(financialProjections).values(projection).returning();
    return result[0];
  }
  
  async deleteFinancialProjection(id: number): Promise<void> {
    await db.delete(financialProjections).where(eq(financialProjections.id, id));
  }
  
  // Notification preferences methods
  async getNotificationPreferences(id: number): Promise<NotificationPreference | undefined> {
    const result = await db.select().from(notificationPreferences).where(eq(notificationPreferences.id, id));
    return result[0];
  }
  
  async getNotificationPreferencesByUserId(userId: number): Promise<NotificationPreference | undefined> {
    const result = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return result[0];
  }
  
  async createNotificationPreferences(preferences: InsertNotificationPreference): Promise<NotificationPreference> {
    const result = await db.insert(notificationPreferences).values(preferences).returning();
    return result[0];
  }
  
  async updateNotificationPreferences(id: number, data: Partial<InsertNotificationPreference>): Promise<NotificationPreference | undefined> {
    const result = await db.update(notificationPreferences).set(data).where(eq(notificationPreferences.id, id)).returning();
    return result[0];
  }
  
  // Milestone methods
  async getMilestone(id: number): Promise<Milestone | undefined> {
    const result = await db.select().from(milestones).where(eq(milestones.id, id));
    return result[0];
  }
  
  async getMilestonesByUserId(userId: number): Promise<Milestone[]> {
    return await db.select().from(milestones).where(eq(milestones.userId, userId));
  }
  
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const result = await db.insert(milestones).values(milestone).returning();
    return result[0];
  }
  
  async updateMilestone(id: number, data: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const result = await db.update(milestones).set(data).where(eq(milestones.id, id)).returning();
    return result[0];
  }
  
  async deleteMilestone(id: number): Promise<void> {
    await db.delete(milestones).where(eq(milestones.id, id));
  }
  
  // Career path methods
  async getCareerPath(id: number): Promise<CareerPath | undefined> {
    const result = await db.select().from(careerPaths).where(eq(careerPaths.id, id));
    return result[0];
  }
  
  async getCareerPathsByField(fieldOfStudy: string): Promise<CareerPath[]> {
    return await db.select().from(careerPaths).where(eq(careerPaths.field_of_study, fieldOfStudy));
  }
  
  async getAllCareerPaths(): Promise<CareerPath[]> {
    return await db.select().from(careerPaths);
  }
  
  async createCareerPath(careerPath: InsertCareerPath): Promise<CareerPath> {
    const result = await db.insert(careerPaths).values(careerPath).returning();
    return result[0];
  }
  
  // Location cost of living methods
  async getLocationCostOfLiving(id: number): Promise<LocationCostOfLiving | undefined> {
    const result = await db.select().from(locationCostOfLiving).where(eq(locationCostOfLiving.id, id));
    return result[0];
  }
  
  async getLocationCostOfLivingByZipCode(zipCode: string): Promise<LocationCostOfLiving | undefined> {
    const result = await db.select().from(locationCostOfLiving).where(eq(locationCostOfLiving.zip_code, zipCode));
    return result[0];
  }
  
  async getLocationCostOfLivingByCityState(city: string, state: string): Promise<LocationCostOfLiving[]> {
    // Case insensitive search for city and exact match for state code
    const lowercaseCity = city.toLowerCase();
    const result = await db.select()
      .from(locationCostOfLiving)
      .where(
        and(
          eq(locationCostOfLiving.state, state),
          sql`LOWER(${locationCostOfLiving.city}) LIKE ${`%${lowercaseCity}%`}`
        )
      )
      .limit(10);
    return result;
  }
  
  async getAllLocationCostOfLiving(): Promise<LocationCostOfLiving[]> {
    return await db.select().from(locationCostOfLiving);
  }
  
  async createLocationCostOfLiving(data: InsertLocationCostOfLiving): Promise<LocationCostOfLiving> {
    const result = await db.insert(locationCostOfLiving).values(data).returning();
    return result[0];
  }
  
  // Zip code income methods
  async getZipCodeIncome(id: number): Promise<ZipCodeIncome | undefined> {
    const result = await db.select().from(zipCodeIncome).where(eq(zipCodeIncome.id, id));
    return result[0];
  }
  
  async getZipCodeIncomeByZipCode(zipCode: string): Promise<ZipCodeIncome | undefined> {
    const result = await db.select().from(zipCodeIncome).where(eq(zipCodeIncome.zip_code, zipCode));
    return result[0];
  }
  
  async getAllZipCodeIncomes(): Promise<ZipCodeIncome[]> {
    return await db.select().from(zipCodeIncome);
  }
  
  async createZipCodeIncome(data: InsertZipCodeIncome): Promise<ZipCodeIncome> {
    const result = await db.insert(zipCodeIncome).values(data).returning();
    return result[0];
  }

  // College calculations methods
  async getCollegeCalculation(id: number): Promise<CollegeCalculation | undefined> {
    const calculation = await db.select().from(collegeCalculations).where(eq(collegeCalculations.id, id));
    if (calculation.length === 0) return undefined;
    
    console.log(`Retrieving college calculation with ID ${id}:`, calculation[0]);
    
    // Now fetch the college data separately
    if (calculation[0].collegeId) {
      const collegeData = await db.select().from(colleges).where(eq(colleges.id, calculation[0].collegeId));
      if (collegeData.length > 0) {
        // Add college data to the calculation result with full details
        const enrichedCalculation = {
          ...calculation[0],
          college: {
            id: collegeData[0].id,
            name: collegeData[0].name,
            type: collegeData[0].type,
            location: collegeData[0].location,
            state: collegeData[0].state,
            tuition: collegeData[0].tuition,
            roomAndBoard: collegeData[0].roomAndBoard,
            acceptanceRate: collegeData[0].acceptanceRate,
            rating: collegeData[0].rating
          }
        } as CollegeCalculation;
        
        console.log(`Enhanced college calculation with college data:`, enrichedCalculation.college);
        return enrichedCalculation;
      } else {
        console.log(`College with ID ${calculation[0].collegeId} not found for calculation ${id}`);
      }
    }
    
    return calculation[0] as CollegeCalculation;
  }

  async getCollegeCalculationsByUserId(userId: number): Promise<CollegeCalculation[]> {
    // Get all college calculations for this user
    const calculations = await db.select().from(collegeCalculations).where(eq(collegeCalculations.userId, userId));
    
    // Debug log to track included projections
    const includedCalc = calculations.find(calc => calc.includedInProjection);
    if (includedCalc) {
      console.log(`Found included college calculation for user ${userId}:`, includedCalc);
    }
    
    // Get all college IDs from the calculations
    const collegeIds = calculations.map(calc => calc.collegeId);
    
    // If there are no calculations or no college IDs, return the raw calculations
    if (calculations.length === 0 || collegeIds.length === 0) {
      console.log(`No college calculations or college IDs found for user ${userId}`);
      return calculations;
    }
    
    console.log(`Fetching college data for ${collegeIds.length} colleges`);
    
    // Get all colleges for these IDs in a single query
    const collegeData = await db.select().from(colleges)
      .where(
        or(...collegeIds.map(id => eq(colleges.id, id)))
      );
    
    console.log(`Found ${collegeData.length} colleges for calculations`);
    
    // Create a map of college ID to college data for quick lookup
    const collegeMap = new Map();
    for (const college of collegeData) {
      collegeMap.set(college.id, college);
    }
    
    // Add college data to each calculation
    return calculations.map(calc => {
      const college = collegeMap.get(calc.collegeId);
      if (college) {
        // Create a more comprehensive college object with all available data
        const result = {
          ...calc,
          college: {
            id: college.id,
            name: college.name,
            type: college.type,
            location: college.location,
            state: college.state,
            tuition: college.tuition,
            roomAndBoard: college.roomAndBoard,
            acceptanceRate: college.acceptanceRate,
            rating: college.rating
          }
        } as CollegeCalculation;
        
        // Log the included college data for debugging
        if (calc.includedInProjection) {
          console.log(`Enhanced college data for included projection:`, result.college);
        }
        
        return result;
      }
      
      // If college not found, log error and return basic calculation
      console.log(`Warning: College data not found for calculation (collegeId: ${calc.collegeId})`);
      return calc as CollegeCalculation;
    });
  }

  async getCollegeCalculationsByUserAndCollege(userId: number, collegeId: number): Promise<CollegeCalculation[]> {
    // Get calculations matching both user and college
    const calculations = await db.select().from(collegeCalculations)
      .where(and(
        eq(collegeCalculations.userId, userId),
        eq(collegeCalculations.collegeId, collegeId)
      ));
    
    if (calculations.length === 0) {
      return calculations;
    }
    
    // Get the college data
    const collegeData = await db.select().from(colleges).where(eq(colleges.id, collegeId));
    if (collegeData.length === 0) {
      return calculations;
    }
    
    const college = collegeData[0];
    
    // Add college data to each calculation with full college details
    return calculations.map(calc => {
      return {
        ...calc,
        college: {
          id: college.id,
          name: college.name,
          type: college.type,
          location: college.location,
          state: college.state,
          tuition: college.tuition,
          roomAndBoard: college.roomAndBoard,
          acceptanceRate: college.acceptanceRate,
          rating: college.rating
        }
      } as CollegeCalculation;
    });
  }

  async createCollegeCalculation(calculation: InsertCollegeCalculation): Promise<CollegeCalculation> {
    const result = await db.insert(collegeCalculations).values(calculation).returning();
    return result[0];
  }

  async updateCollegeCalculation(id: number, data: Partial<InsertCollegeCalculation>): Promise<CollegeCalculation | undefined> {
    const result = await db.update(collegeCalculations).set(data).where(eq(collegeCalculations.id, id)).returning();
    return result[0];
  }

  async deleteCollegeCalculation(id: number): Promise<void> {
    await db.delete(collegeCalculations).where(eq(collegeCalculations.id, id));
  }
  
  async toggleProjectionInclusion(id: number, userId: number): Promise<CollegeCalculation | undefined> {
    // First find the calculation to make sure it exists and belongs to the user
    const calculation = await this.getCollegeCalculation(id);
    if (!calculation || calculation.userId !== userId) {
      return undefined;
    }
    
    // Begin a transaction
    return await db.transaction(async (tx) => {
      // First, reset all other calculations for this user
      await tx
        .update(collegeCalculations)
        .set({ includedInProjection: false })
        .where(eq(collegeCalculations.userId, userId));
      
      // Then set this specific calculation to true
      const result = await tx
        .update(collegeCalculations)
        .set({ includedInProjection: true })
        .where(eq(collegeCalculations.id, id))
        .returning();
      
      // Get the updated calculation with college details
      const updatedCalc = await this.getCollegeCalculation(id);  
      return updatedCalc;
    });
  }
  
  // Career calculations methods
  async getCareerCalculation(id: number): Promise<CareerCalculation | undefined> {
    const result = await db.select().from(careerCalculations).where(eq(careerCalculations.id, id));
    return result[0];
  }

  async getCareerCalculationsByUserId(userId: number): Promise<(CareerCalculation & { career: Career })[]> {
    const calculations = await db.select({
      calculation: careerCalculations,
      career: careers
    }).from(careerCalculations)
      .leftJoin(careers, eq(careerCalculations.careerId, careers.id))
      .where(eq(careerCalculations.userId, userId));
      
    return calculations.map(({ calculation, career }) => {
      if (!career) {
        throw new Error(`Career not found for calculation ID ${calculation.id}`);
      }
      return { ...calculation, career };
    });
  }

  async getCareerCalculationsByUserAndCareer(userId: number, careerId: number): Promise<CareerCalculation[]> {
    return await db.select().from(careerCalculations)
      .where(and(
        eq(careerCalculations.userId, userId),
        eq(careerCalculations.careerId, careerId)
      ));
  }

  async createCareerCalculation(calculation: InsertCareerCalculation): Promise<CareerCalculation> {
    const result = await db.insert(careerCalculations).values(calculation).returning();
    return result[0];
  }

  async updateCareerCalculation(id: number, data: Partial<InsertCareerCalculation>): Promise<CareerCalculation | undefined> {
    const result = await db.update(careerCalculations).set(data).where(eq(careerCalculations.id, id)).returning();
    return result[0];
  }

  async deleteCareerCalculation(id: number): Promise<void> {
    await db.delete(careerCalculations).where(eq(careerCalculations.id, id));
  }
  
  async toggleCareerProjectionInclusion(id: number, userId: number): Promise<CareerCalculation | undefined> {
    // First find the calculation to make sure it exists and belongs to the user
    const calculation = await this.getCareerCalculation(id);
    if (!calculation || calculation.userId !== userId) {
      return undefined;
    }
    
    // Begin a transaction
    return await db.transaction(async (tx) => {
      // First, reset all other career calculations for this user
      await tx
        .update(careerCalculations)
        .set({ includedInProjection: false })
        .where(eq(careerCalculations.userId, userId));
      
      // Then set this specific calculation to true
      const result = await tx
        .update(careerCalculations)
        .set({ includedInProjection: true })
        .where(eq(careerCalculations.id, id))
        .returning();
        
      return result[0];
    });
  }

  // Assumption methods
  async getAssumption(id: number): Promise<Assumption | undefined> {
    const result = await db.select().from(assumptions).where(eq(assumptions.id, id));
    return result[0];
  }

  async getAssumptionsByUserId(userId: number): Promise<Assumption[]> {
    return await db.select().from(assumptions).where(eq(assumptions.userId, userId));
  }

  async getAssumptionsByCategory(userId: number, category: string): Promise<Assumption[]> {
    return await db.select().from(assumptions)
      .where(and(
        eq(assumptions.userId, userId),
        eq(assumptions.category, category)
      ));
  }
  
  async createAssumption(assumption: InsertAssumption): Promise<Assumption> {
    const result = await db.insert(assumptions).values(assumption).returning();
    return result[0];
  }

  async updateAssumption(id: number, data: Partial<InsertAssumption>): Promise<Assumption | undefined> {
    const result = await db.update(assumptions).set(data).where(eq(assumptions.id, id)).returning();
    return result[0];
  }

  async deleteAssumption(id: number): Promise<void> {
    await db.delete(assumptions).where(eq(assumptions.id, id));
  }

  async initializeDefaultAssumptions(userId: number): Promise<Assumption[]> {
    // Transform defaults by adding userId
    const userAssumptions = defaultAssumptions.map(assumption => ({
      ...assumption,
      userId
    }));
    
    // Insert all defaults in one batch
    const result = await db.insert(assumptions).values(userAssumptions).returning();
    return result;
  }

  async getPathwayResponse(id: number): Promise<PathwayResponse | undefined> {
    const [result] = await db.select().from(pathwayResponses).where(eq(pathwayResponses.id, id));
    return result;
  }

  async createPathwayResponse(response: InsertPathwayResponse): Promise<PathwayResponse> {
    const [result] = await db.insert(pathwayResponses).values(response).returning();
    return result;
  }

  async getPathwayResponsesByUserId(userId: number): Promise<PathwayResponse[]> {
    return await db.select().from(pathwayResponses).where(eq(pathwayResponses.userId, userId));
  }

  async updatePathwayResponse(id: number, response: string): Promise<PathwayResponse> {
    const [result] = await db
      .update(pathwayResponses)
      .set({ response, updatedAt: new Date() })
      .where(eq(pathwayResponses.id, id))
      .returning();
    return result;
  }

  async deletePathwayResponse(id: number): Promise<void> {
    await db.delete(pathwayResponses).where(eq(pathwayResponses.id, id));
  }

  // Quick Spin Response methods
  async createQuickSpinResponse(response: InsertQuickSpinResponse): Promise<QuickSpinResponse> {
    const result = await this.pool.query(
      `INSERT INTO quick_spin_responses (
        user_id,
        superpower,
        ideal_day,
        values,
        activities,
        preferences
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        response.userId,
        response.superpower,
        response.ideal_day,
        response.values,
        response.activities,
        JSON.stringify(response.preferences)
      ]
    );
    return this.mapQuickSpinResponse(result.rows[0]);
  }

  async getQuickSpinResponsesByUserId(userId: number): Promise<QuickSpinResponse[]> {
    const result = await this.pool.query(
      'SELECT * FROM quick_spin_responses WHERE user_id = $1',
      [userId]
    );
    return result.rows.map(row => this.mapQuickSpinResponse(row));
  }

  async getQuickSpinResponse(id: number): Promise<QuickSpinResponse | undefined> {
    const result = await this.pool.query(
      'SELECT * FROM quick_spin_responses WHERE id = $1',
      [id]
    );
    return result.rows.length ? this.mapQuickSpinResponse(result.rows[0]) : undefined;
  }

  async updateQuickSpinResponse(id: number, data: Partial<InsertQuickSpinResponse>): Promise<QuickSpinResponse | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.superpower !== undefined) {
      updates.push(`superpower = $${paramCount}`);
      values.push(data.superpower);
      paramCount++;
    }
    if (data.ideal_day !== undefined) {
      updates.push(`ideal_day = $${paramCount}`);
      values.push(data.ideal_day);
      paramCount++;
    }
    if (data.values !== undefined) {
      updates.push(`values = $${paramCount}`);
      values.push(data.values);
      paramCount++;
    }
    if (data.activities !== undefined) {
      updates.push(`activities = $${paramCount}`);
      values.push(data.activities);
      paramCount++;
    }
    if (data.preferences !== undefined) {
      updates.push(`preferences = $${paramCount}`);
      values.push(JSON.stringify(data.preferences));
      paramCount++;
    }

    if (updates.length === 0) return this.getQuickSpinResponse(id);

    values.push(id);
    const result = await this.pool.query(
      `UPDATE quick_spin_responses SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows.length ? this.mapQuickSpinResponse(result.rows[0]) : undefined;
  }

  async deleteQuickSpinResponse(id: number): Promise<void> {
    await this.pool.query(
      'DELETE FROM quick_spin_responses WHERE id = $1',
      [id]
    );
  }

  private mapQuickSpinResponse(row: any): QuickSpinResponse {
    return {
      id: row.id,
      userId: row.user_id,
      superpower: row.superpower,
      ideal_day: row.ideal_day,
      values: row.values,
      activities: row.activities,
      preferences: JSON.parse(row.preferences),
      createdAt: row.created_at
    };
  }
}

// Export the PostgreSQL storage instance
export const pgStorage = new PgStorage();
