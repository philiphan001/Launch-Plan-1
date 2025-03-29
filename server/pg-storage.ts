import { db } from './db';
import { 
  users, type User, type InsertUser,
  financialProfiles, type FinancialProfile, type InsertFinancialProfile,
  colleges, type College, type InsertCollege,
  careers, type Career, type InsertCareer,
  favoriteColleges, type FavoriteCollege, type InsertFavoriteCollege,
  favoriteCareers, type FavoriteCareer, type InsertFavoriteCareer,
  financialProjections, type FinancialProjection, type InsertFinancialProjection,
  notificationPreferences, type NotificationPreference, type InsertNotificationPreference,
  milestones, type Milestone, type InsertMilestone,
  careerPaths, type CareerPath, type InsertCareerPath,
  locationCostOfLiving, type LocationCostOfLiving, type InsertLocationCostOfLiving,
  zipCodeIncome, type ZipCodeIncome, type InsertZipCodeIncome
} from "@shared/schema";
import { IStorage } from './storage';
import { eq, and } from 'drizzle-orm';

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
    return result[0];
  }
  
  async getColleges(): Promise<College[]> {
    return await db.select().from(colleges);
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
    return favs.map(({ favorite, college }) => ({ ...favorite, college }));
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
    return favs.map(({ favorite, career }) => ({ ...favorite, career }));
  }
  
  async addFavoriteCareer(userId: number, careerId: number): Promise<FavoriteCareer> {
    const result = await db.insert(favoriteCareers).values({ userId, careerId }).returning();
    return result[0];
  }
  
  async removeFavoriteCareer(id: number): Promise<void> {
    await db.delete(favoriteCareers).where(eq(favoriteCareers.id, id));
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
}

// Export the PostgreSQL storage instance
export const pgStorage = new PgStorage();
