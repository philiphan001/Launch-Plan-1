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
  collegeCalculations, type CollegeCalculation, type InsertCollegeCalculation,
  careerCalculations, type CareerCalculation, type InsertCareerCalculation,
  assumptions, type Assumption, type InsertAssumption, defaultAssumptions
} from "@shared/schema";

// Storage interface with CRUD methods for all entities
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Financial profile methods
  getFinancialProfile(id: number): Promise<FinancialProfile | undefined>;
  getFinancialProfileByUserId(userId: number): Promise<FinancialProfile | undefined>;
  createFinancialProfile(profile: InsertFinancialProfile): Promise<FinancialProfile>;
  updateFinancialProfile(id: number, data: Partial<InsertFinancialProfile>): Promise<FinancialProfile | undefined>;
  
  // College methods
  getCollege(id: number): Promise<College | undefined>;
  getColleges(): Promise<College[]>;
  searchColleges(query: string, educationType?: string): Promise<College[]>;
  createCollege(college: InsertCollege): Promise<College>;
  
  // Career methods
  getCareer(id: number): Promise<Career | undefined>;
  getCareers(): Promise<Career[]>;
  searchCareers(query: string): Promise<Career[]>;
  createCareer(career: InsertCareer): Promise<Career>;
  
  // Favorite college methods
  getFavoriteCollege(id: number): Promise<FavoriteCollege | undefined>;
  getFavoriteCollegesByUserId(userId: number): Promise<(FavoriteCollege & { college: College })[]>;
  addFavoriteCollege(userId: number, collegeId: number): Promise<FavoriteCollege>;
  removeFavoriteCollege(id: number): Promise<void>;
  
  // Favorite career methods
  getFavoriteCareer(id: number): Promise<FavoriteCareer | undefined>;
  getFavoriteCareersByUserId(userId: number): Promise<(FavoriteCareer & { career: Career })[]>;
  addFavoriteCareer(userId: number, careerId: number): Promise<FavoriteCareer>;
  removeFavoriteCareer(id: number): Promise<void>;
  
  // Favorite location methods
  getFavoriteLocation(id: number): Promise<FavoriteLocation | undefined>;
  getFavoriteLocationsByUserId(userId: number): Promise<FavoriteLocation[]>;
  getFavoriteLocationByZipCode(userId: number, zipCode: string): Promise<FavoriteLocation | undefined>;
  addFavoriteLocation(userId: number, zipCode: string, city?: string, state?: string): Promise<FavoriteLocation>;
  removeFavoriteLocation(id: number): Promise<void>;
  
  // Financial projection methods
  getFinancialProjection(id: number): Promise<FinancialProjection | undefined>;
  getFinancialProjectionsByUserId(userId: number): Promise<FinancialProjection[]>;
  createFinancialProjection(projection: InsertFinancialProjection): Promise<FinancialProjection>;
  deleteFinancialProjection(id: number): Promise<void>;
  
  // Notification preferences methods
  getNotificationPreferences(id: number): Promise<NotificationPreference | undefined>;
  getNotificationPreferencesByUserId(userId: number): Promise<NotificationPreference | undefined>;
  createNotificationPreferences(preferences: InsertNotificationPreference): Promise<NotificationPreference>;
  updateNotificationPreferences(id: number, data: Partial<InsertNotificationPreference>): Promise<NotificationPreference | undefined>;
  
  // Milestone methods
  getMilestone(id: number): Promise<Milestone | undefined>;
  getMilestonesByUserId(userId: number): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, data: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<void>;
  
  // Career path methods
  getCareerPath(id: number): Promise<CareerPath | undefined>;
  getCareerPathsByField(fieldOfStudy: string): Promise<CareerPath[]>;
  getAllCareerPaths(): Promise<CareerPath[]>;
  createCareerPath(careerPath: InsertCareerPath): Promise<CareerPath>;
  
  // Location cost of living methods
  getLocationCostOfLiving(id: number): Promise<LocationCostOfLiving | undefined>;
  getLocationCostOfLivingByZipCode(zipCode: string): Promise<LocationCostOfLiving | undefined>;
  getLocationCostOfLivingByCityState(city: string, state: string): Promise<LocationCostOfLiving[]>;
  getAllLocationCostOfLiving(): Promise<LocationCostOfLiving[]>;
  createLocationCostOfLiving(locationCostOfLiving: InsertLocationCostOfLiving): Promise<LocationCostOfLiving>;
  
  // Zip code income methods
  getZipCodeIncome(id: number): Promise<ZipCodeIncome | undefined>;
  getZipCodeIncomeByZipCode(zipCode: string): Promise<ZipCodeIncome | undefined>;
  getAllZipCodeIncomes(): Promise<ZipCodeIncome[]>;
  createZipCodeIncome(zipCodeIncome: InsertZipCodeIncome): Promise<ZipCodeIncome>;

  // College calculations methods
  getCollegeCalculation(id: number): Promise<CollegeCalculation | undefined>;
  getCollegeCalculationsByUserId(userId: number): Promise<CollegeCalculation[]>;
  getCollegeCalculationsByUserAndCollege(userId: number, collegeId: number): Promise<CollegeCalculation[]>;
  createCollegeCalculation(calculation: InsertCollegeCalculation): Promise<CollegeCalculation>;
  updateCollegeCalculation(id: number, data: Partial<InsertCollegeCalculation>): Promise<CollegeCalculation | undefined>;
  deleteCollegeCalculation(id: number): Promise<void>;
  toggleProjectionInclusion(id: number, userId: number): Promise<CollegeCalculation | undefined>;
  
  // Career calculations methods
  getCareerCalculation(id: number): Promise<CareerCalculation | undefined>;
  getCareerCalculationsByUserId(userId: number): Promise<(CareerCalculation & { career: Career })[]>;
  getCareerCalculationsByUserAndCareer(userId: number, careerId: number): Promise<CareerCalculation[]>;
  createCareerCalculation(calculation: InsertCareerCalculation): Promise<CareerCalculation>;
  updateCareerCalculation(id: number, data: Partial<InsertCareerCalculation>): Promise<CareerCalculation | undefined>;
  deleteCareerCalculation(id: number): Promise<void>;
  toggleCareerProjectionInclusion(id: number, userId: number): Promise<CareerCalculation | undefined>;

  // Assumption methods
  getAssumption(id: number): Promise<Assumption | undefined>;
  getAssumptionsByUserId(userId: number): Promise<Assumption[]>;
  getAssumptionsByCategory(userId: number, category: string): Promise<Assumption[]>;
  createAssumption(assumption: InsertAssumption): Promise<Assumption>;
  updateAssumption(id: number, data: Partial<InsertAssumption>): Promise<Assumption | undefined>;
  deleteAssumption(id: number): Promise<void>;
  initializeDefaultAssumptions(userId: number): Promise<Assumption[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private financialProfiles: Map<number, FinancialProfile>;
  private colleges: Map<number, College>;
  private careers: Map<number, Career>;
  private favoriteColleges: Map<number, FavoriteCollege>;
  private favoriteCareers: Map<number, FavoriteCareer>;
  private favoriteLocations: Map<number, FavoriteLocation>;
  private financialProjections: Map<number, FinancialProjection>;
  private notificationPreferences: Map<number, NotificationPreference>;
  private milestones: Map<number, Milestone>;
  private careerPaths: Map<number, CareerPath>;
  private locationCostOfLivings: Map<number, LocationCostOfLiving>;
  private zipCodeIncomes: Map<number, ZipCodeIncome>;
  private collegeCalculations: Map<number, CollegeCalculation>;
  private careerCalculations: Map<number, CareerCalculation>;
  private assumptions: Map<number, Assumption>;
  
  // Auto-increment IDs
  private userId: number;
  private financialProfileId: number;
  private collegeId: number;
  private careerId: number;
  private favoriteCollegeId: number;
  private favoriteCarerId: number;
  private favoriteLocationId: number;
  private financialProjectionId: number;
  private notificationPreferenceId: number;
  private milestoneId: number;
  private careerPathId: number;
  private locationCostOfLivingId: number;
  private zipCodeIncomeId: number;
  private collegeCalculationId: number;
  private careerCalculationId: number;
  private assumptionId: number;

  constructor() {
    this.users = new Map();
    this.financialProfiles = new Map();
    this.colleges = new Map();
    this.careers = new Map();
    this.favoriteColleges = new Map();
    this.favoriteCareers = new Map();
    this.favoriteLocations = new Map();
    this.financialProjections = new Map();
    this.notificationPreferences = new Map();
    this.milestones = new Map();
    this.careerPaths = new Map();
    this.locationCostOfLivings = new Map();
    this.zipCodeIncomes = new Map();
    this.collegeCalculations = new Map();
    this.careerCalculations = new Map();
    this.assumptions = new Map();
    
    this.userId = 1;
    this.financialProfileId = 1;
    this.collegeId = 1;
    this.careerId = 1;
    this.favoriteCollegeId = 1;
    this.favoriteCarerId = 1;
    this.favoriteLocationId = 1;
    this.financialProjectionId = 1;
    this.notificationPreferenceId = 1;
    this.milestoneId = 1;
    this.careerPathId = 1;
    this.locationCostOfLivingId = 1;
    this.zipCodeIncomeId = 1;
    this.collegeCalculationId = 1;
    this.careerCalculationId = 1;
    this.assumptionId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add some sample colleges
    this.createCollege({
      name: "University of Washington",
      location: "Seattle, WA",
      state: "WA",
      type: "Public Research",
      tuition: 11465,
      roomAndBoard: 13485,
      acceptanceRate: 70,
      rating: 4.5,
      size: "large",
      rank: 58,
      feesByIncome: {
        "0-30000": 4000,
        "30001-48000": 6000,
        "48001-75000": 9000,
        "75001-110000": 15000,
        "110001+": 24950
      }
    });
    
    this.createCollege({
      name: "Stanford University",
      location: "Stanford, CA",
      state: "CA",
      type: "Private Research",
      tuition: 56169,
      roomAndBoard: 17255,
      acceptanceRate: 5,
      rating: 4.8,
      size: "medium",
      rank: 3,
      feesByIncome: {
        "0-30000": 5000,
        "30001-48000": 7500,
        "48001-75000": 12000,
        "75001-110000": 20000,
        "110001+": 73424
      }
    });
    
    // Add some sample careers
    this.createCareer({
      title: "Software Developer",
      description: "Design, develop, and test software applications",
      salary: 107510,
      growthRate: "fast",
      education: "Bachelor's",
      category: "Technology",
      alias1: "Programmer",
      alias2: "Software Engineer",
      alias3: "Web Developer",
      alias4: "Application Developer",
      alias5: "Coder"
    });
    
    this.createCareer({
      title: "Financial Analyst",
      description: "Analyze financial data and market trends",
      salary: 83660,
      growthRate: "stable",
      education: "Bachelor's",
      category: "Finance",
      alias1: "Investment Analyst",
      alias2: "Financial Advisor",
      alias3: "Portfolio Manager",
      alias4: "Finance Specialist",
      alias5: "Budget Analyst"
    });
    
    // Add sample career paths
    this.createCareerPath({
      field_of_study: "Computer Science",
      career_title: "Software Engineer",
      option_rank: 1
    });
    
    this.createCareerPath({
      field_of_study: "Computer Science",
      career_title: "Data Scientist",
      option_rank: 2
    });
    
    // Add sample location cost of living
    this.createLocationCostOfLiving({
      zip_code: "98101",
      city: "Seattle",
      state: "WA",
      housing: 1850,
      transportation: 450,
      food: 550,
      healthcare: 350,
      personal_insurance: 120,
      apparel: 100,
      services: 200,
      entertainment: 300,
      other: 250,
      monthly_expense: 4170,
      income_adjustment_factor: 1.3
    });
    
    this.createLocationCostOfLiving({
      zip_code: "94305",
      city: "Stanford",
      state: "CA",
      housing: 2600,
      transportation: 500,
      food: 650,
      healthcare: 400,
      personal_insurance: 150,
      apparel: 120,
      services: 250,
      entertainment: 350,
      other: 300,
      monthly_expense: 5320,
      income_adjustment_factor: 1.6
    });
    
    // Add sample zip code income data
    this.createZipCodeIncome({
      zip_code: "98101",
      state: "WA",
      mean_income: 98500,
      estimated_investments: 350000,
      home_value: 750000
    });
    
    this.createZipCodeIncome({
      zip_code: "94305",
      state: "CA",
      mean_income: 128000,
      estimated_investments: 520000,
      home_value: 1800000
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Financial profile methods
  async getFinancialProfile(id: number): Promise<FinancialProfile | undefined> {
    return this.financialProfiles.get(id);
  }
  
  async getFinancialProfileByUserId(userId: number): Promise<FinancialProfile | undefined> {
    return Array.from(this.financialProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createFinancialProfile(insertProfile: InsertFinancialProfile): Promise<FinancialProfile> {
    const id = this.financialProfileId++;
    const timestamp = new Date();
    const profile: FinancialProfile = { ...insertProfile, id, updatedAt: timestamp };
    this.financialProfiles.set(id, profile);
    return profile;
  }
  
  async updateFinancialProfile(id: number, data: Partial<InsertFinancialProfile>): Promise<FinancialProfile | undefined> {
    const profile = await this.getFinancialProfile(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...data, updatedAt: new Date() };
    this.financialProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  // College methods
  async getCollege(id: number): Promise<College | undefined> {
    return this.colleges.get(id);
  }
  
  async getColleges(): Promise<College[]> {
    return Array.from(this.colleges.values());
  }
  
  async searchColleges(query: string, educationType?: string): Promise<College[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    const searchQuery = query.toLowerCase().trim();
    let colleges = Array.from(this.colleges.values());
    
    // First filter by education type if provided
    if (educationType) {
      colleges = colleges.filter(college => {
        if (!college.type) return false;
        
        // For education types, we'll do a fuzzy match
        const collegeType = college.type.toLowerCase();
        
        // Map the education type from pathways to college types in our data
        switch (educationType) {
          case '4year':
            return collegeType.includes('research') || 
                  collegeType.includes('university') || 
                  collegeType.includes('4-year') ||
                  collegeType.includes('4 year');
          case '2year':
            return collegeType.includes('community') || 
                  collegeType.includes('2-year') || 
                  collegeType.includes('2 year') || 
                  collegeType.includes('junior');
          case 'vocational':
            return collegeType.includes('vocational') || 
                  collegeType.includes('technical') || 
                  collegeType.includes('trade') || 
                  collegeType.includes('career');
          default:
            return true;
        }
      });
    }
    
    // Then filter by search query
    return colleges.filter(college => {
      if (!college.name) return false;
      
      const collegeName = college.name.toLowerCase();
      const collegeLocation = college.location ? college.location.toLowerCase() : '';
      
      return collegeName.includes(searchQuery) || collegeLocation.includes(searchQuery);
    });
  }
  
  async createCollege(insertCollege: InsertCollege): Promise<College> {
    const id = this.collegeId++;
    const college: College = { ...insertCollege, id };
    this.colleges.set(id, college);
    return college;
  }
  
  // Career methods
  async getCareer(id: number): Promise<Career | undefined> {
    return this.careers.get(id);
  }
  
  async getCareers(): Promise<Career[]> {
    return Array.from(this.careers.values());
  }
  
  async createCareer(insertCareer: InsertCareer): Promise<Career> {
    const id = this.careerId++;
    const career: Career = { ...insertCareer, id };
    this.careers.set(id, career);
    return career;
  }
  
  // Favorite college methods
  async getFavoriteCollege(id: number): Promise<FavoriteCollege | undefined> {
    return this.favoriteColleges.get(id);
  }
  
  async getFavoriteCollegesByUserId(userId: number): Promise<(FavoriteCollege & { college: College })[]> {
    const favorites = Array.from(this.favoriteColleges.values()).filter(
      (favorite) => favorite.userId === userId,
    );
    
    return favorites.map(favorite => {
      const college = this.colleges.get(favorite.collegeId);
      return { ...favorite, college: college! };
    });
  }
  
  async addFavoriteCollege(userId: number, collegeId: number): Promise<FavoriteCollege> {
    const id = this.favoriteCollegeId++;
    const timestamp = new Date();
    const favorite: FavoriteCollege = { id, userId, collegeId, createdAt: timestamp };
    this.favoriteColleges.set(id, favorite);
    return favorite;
  }
  
  async removeFavoriteCollege(id: number): Promise<void> {
    this.favoriteColleges.delete(id);
  }
  
  // Favorite career methods
  async getFavoriteCareer(id: number): Promise<FavoriteCareer | undefined> {
    return this.favoriteCareers.get(id);
  }
  
  async getFavoriteCareersByUserId(userId: number): Promise<(FavoriteCareer & { career: Career })[]> {
    const favorites = Array.from(this.favoriteCareers.values()).filter(
      (favorite) => favorite.userId === userId,
    );
    
    return favorites.map(favorite => {
      const career = this.careers.get(favorite.careerId);
      return { ...favorite, career: career! };
    });
  }
  
  async addFavoriteCareer(userId: number, careerId: number): Promise<FavoriteCareer> {
    const id = this.favoriteCarerId++;
    const timestamp = new Date();
    const favorite: FavoriteCareer = { id, userId, careerId, createdAt: timestamp };
    this.favoriteCareers.set(id, favorite);
    return favorite;
  }
  
  async removeFavoriteCareer(id: number): Promise<void> {
    this.favoriteCareers.delete(id);
  }
  
  // Favorite location methods
  async getFavoriteLocation(id: number): Promise<FavoriteLocation | undefined> {
    return this.favoriteLocations.get(id);
  }
  
  async getFavoriteLocationsByUserId(userId: number): Promise<FavoriteLocation[]> {
    return Array.from(this.favoriteLocations.values()).filter(
      (favorite) => favorite.userId === userId,
    );
  }
  
  async getFavoriteLocationByZipCode(userId: number, zipCode: string): Promise<FavoriteLocation | undefined> {
    return Array.from(this.favoriteLocations.values()).find(
      (favorite) => favorite.userId === userId && favorite.zipCode === zipCode,
    );
  }
  
  async addFavoriteLocation(userId: number, zipCode: string, city?: string, state?: string): Promise<FavoriteLocation> {
    // Check if the favorite location already exists
    const existingFavorite = await this.getFavoriteLocationByZipCode(userId, zipCode);
    if (existingFavorite) {
      return existingFavorite;
    }
    
    // Look up location info if city and state are not provided
    if (!city || !state) {
      const locationInfo = await this.getLocationCostOfLivingByZipCode(zipCode);
      if (locationInfo) {
        city = locationInfo.city || undefined;
        state = locationInfo.state || undefined;
      }
    }
    
    const id = this.favoriteLocationId++;
    const timestamp = new Date();
    const favorite: FavoriteLocation = { 
      id, 
      userId, 
      zipCode, 
      city: city || null, 
      state: state || null, 
      createdAt: timestamp 
    };
    this.favoriteLocations.set(id, favorite);
    return favorite;
  }
  
  async removeFavoriteLocation(id: number): Promise<void> {
    this.favoriteLocations.delete(id);
  }
  
  // Financial projection methods
  async getFinancialProjection(id: number): Promise<FinancialProjection | undefined> {
    return this.financialProjections.get(id);
  }
  
  async getFinancialProjectionsByUserId(userId: number): Promise<FinancialProjection[]> {
    return Array.from(this.financialProjections.values()).filter(
      (projection) => projection.userId === userId,
    );
  }
  
  async createFinancialProjection(insertProjection: InsertFinancialProjection): Promise<FinancialProjection> {
    const id = this.financialProjectionId++;
    const timestamp = new Date();
    const projection: FinancialProjection = { ...insertProjection, id, createdAt: timestamp };
    this.financialProjections.set(id, projection);
    return projection;
  }
  
  async deleteFinancialProjection(id: number): Promise<void> {
    this.financialProjections.delete(id);
  }
  
  // Notification preferences methods
  async getNotificationPreferences(id: number): Promise<NotificationPreference | undefined> {
    return this.notificationPreferences.get(id);
  }
  
  async getNotificationPreferencesByUserId(userId: number): Promise<NotificationPreference | undefined> {
    return Array.from(this.notificationPreferences.values()).find(
      (preferences) => preferences.userId === userId,
    );
  }
  
  async createNotificationPreferences(insertPreferences: InsertNotificationPreference): Promise<NotificationPreference> {
    const id = this.notificationPreferenceId++;
    const timestamp = new Date();
    const preferences: NotificationPreference = { ...insertPreferences, id, updatedAt: timestamp };
    this.notificationPreferences.set(id, preferences);
    return preferences;
  }
  
  async updateNotificationPreferences(id: number, data: Partial<InsertNotificationPreference>): Promise<NotificationPreference | undefined> {
    const preferences = await this.getNotificationPreferences(id);
    if (!preferences) return undefined;
    
    const updatedPreferences = { ...preferences, ...data, updatedAt: new Date() };
    this.notificationPreferences.set(id, updatedPreferences);
    return updatedPreferences;
  }
  
  // Milestone methods
  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }
  
  async getMilestonesByUserId(userId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(
      (milestone) => milestone.userId === userId,
    );
  }
  
  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = this.milestoneId++;
    const timestamp = new Date();
    const milestone: Milestone = { ...insertMilestone, id, createdAt: timestamp };
    this.milestones.set(id, milestone);
    return milestone;
  }
  
  async updateMilestone(id: number, data: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const milestone = await this.getMilestone(id);
    if (!milestone) return undefined;
    
    const updatedMilestone = { ...milestone, ...data };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }
  
  async deleteMilestone(id: number): Promise<void> {
    this.milestones.delete(id);
  }
  
  // Career path methods
  async getCareerPath(id: number): Promise<CareerPath | undefined> {
    return this.careerPaths.get(id);
  }
  
  async getCareerPathsByField(fieldOfStudy: string): Promise<CareerPath[]> {
    return Array.from(this.careerPaths.values()).filter(
      (careerPath) => careerPath.field_of_study === fieldOfStudy,
    );
  }
  
  async getAllCareerPaths(): Promise<CareerPath[]> {
    return Array.from(this.careerPaths.values());
  }
  
  async createCareerPath(insertCareerPath: InsertCareerPath): Promise<CareerPath> {
    const id = this.careerPathId++;
    const careerPath: CareerPath = { ...insertCareerPath, id };
    this.careerPaths.set(id, careerPath);
    return careerPath;
  }
  
  // Location cost of living methods
  async getLocationCostOfLiving(id: number): Promise<LocationCostOfLiving | undefined> {
    return this.locationCostOfLivings.get(id);
  }
  
  async getLocationCostOfLivingByZipCode(zipCode: string): Promise<LocationCostOfLiving | undefined> {
    return Array.from(this.locationCostOfLivings.values()).find(
      (location) => location.zip_code === zipCode,
    );
  }
  
  async getLocationCostOfLivingByCityState(city: string, state: string): Promise<LocationCostOfLiving[]> {
    if (!city || !state) {
      return [];
    }
    
    const lowercaseCity = city.toLowerCase();
    return Array.from(this.locationCostOfLivings.values())
      .filter(location => {
        // Case insensitive match for city, exact match for state
        return location.state === state && 
               location.city && 
               location.city.toLowerCase().includes(lowercaseCity);
      })
      .slice(0, 10); // Limit to 10 results
  }
  
  async getAllLocationCostOfLiving(): Promise<LocationCostOfLiving[]> {
    return Array.from(this.locationCostOfLivings.values());
  }
  
  async createLocationCostOfLiving(insertLocationCostOfLiving: InsertLocationCostOfLiving): Promise<LocationCostOfLiving> {
    const id = this.locationCostOfLivingId++;
    const locationCostOfLiving: LocationCostOfLiving = { ...insertLocationCostOfLiving, id };
    this.locationCostOfLivings.set(id, locationCostOfLiving);
    return locationCostOfLiving;
  }
  
  // Zip code income methods
  async getZipCodeIncome(id: number): Promise<ZipCodeIncome | undefined> {
    return this.zipCodeIncomes.get(id);
  }
  
  async getZipCodeIncomeByZipCode(zipCode: string): Promise<ZipCodeIncome | undefined> {
    return Array.from(this.zipCodeIncomes.values()).find(
      (income) => income.zip_code === zipCode,
    );
  }
  
  async getAllZipCodeIncomes(): Promise<ZipCodeIncome[]> {
    return Array.from(this.zipCodeIncomes.values());
  }
  
  async createZipCodeIncome(insertZipCodeIncome: InsertZipCodeIncome): Promise<ZipCodeIncome> {
    const id = this.zipCodeIncomeId++;
    const zipCodeIncome: ZipCodeIncome = { ...insertZipCodeIncome, id };
    this.zipCodeIncomes.set(id, zipCodeIncome);
    return zipCodeIncome;
  }

  // College calculation methods

  async getCollegeCalculation(id: number): Promise<CollegeCalculation | undefined> {
    return this.collegeCalculations?.get(id);
  }

  async getCollegeCalculationsByUserId(userId: number): Promise<CollegeCalculation[]> {
    if (!this.collegeCalculations) {
      this.collegeCalculations = new Map();
      return [];
    }
    
    return Array.from(this.collegeCalculations.values()).filter(
      (calculation) => calculation.userId === userId,
    );
  }

  async getCollegeCalculationsByUserAndCollege(userId: number, collegeId: number): Promise<CollegeCalculation[]> {
    if (!this.collegeCalculations) {
      this.collegeCalculations = new Map();
      return [];
    }
    
    return Array.from(this.collegeCalculations.values()).filter(
      (calculation) => calculation.userId === userId && calculation.collegeId === collegeId,
    );
  }

  async createCollegeCalculation(insertCalculation: InsertCollegeCalculation): Promise<CollegeCalculation> {
    if (!this.collegeCalculations) {
      this.collegeCalculations = new Map();
    }
    
    const id = this.collegeCalculationId++;
    const timestamp = new Date();
    const calculation: CollegeCalculation = { 
      ...insertCalculation, 
      id, 
      calculationDate: timestamp 
    };
    this.collegeCalculations.set(id, calculation);
    return calculation;
  }

  async updateCollegeCalculation(id: number, data: Partial<InsertCollegeCalculation>): Promise<CollegeCalculation | undefined> {
    const calculation = await this.getCollegeCalculation(id);
    if (!calculation) return undefined;
    
    const updatedCalculation = { ...calculation, ...data };
    this.collegeCalculations.set(id, updatedCalculation);
    return updatedCalculation;
  }

  async deleteCollegeCalculation(id: number): Promise<void> {
    if (this.collegeCalculations) {
      this.collegeCalculations.delete(id);
    }
  }
  
  async toggleProjectionInclusion(id: number, userId: number): Promise<CollegeCalculation | undefined> {
    const calculation = await this.getCollegeCalculation(id);
    if (!calculation || calculation.userId !== userId) {
      return undefined;
    }
    
    // First reset all calculations for this user
    const userCalculations = await this.getCollegeCalculationsByUserId(userId);
    for (const calc of userCalculations) {
      if (calc.includedInProjection) {
        await this.updateCollegeCalculation(calc.id, { includedInProjection: false });
      }
    }
    
    // Then set this specific calculation to true
    return await this.updateCollegeCalculation(id, { includedInProjection: true });
  }
  
  // Career Calculation methods
  async getCareerCalculation(id: number): Promise<CareerCalculation | undefined> {
    return this.careerCalculations?.get(id);
  }

  async getCareerCalculationsByUserId(userId: number): Promise<(CareerCalculation & { career: Career })[]> {
    if (!this.careerCalculations) {
      this.careerCalculations = new Map();
      return [];
    }
    
    const calculations = Array.from(this.careerCalculations.values()).filter(
      (calculation) => calculation.userId === userId,
    );
    
    return calculations.map(calculation => {
      const career = this.careers.get(calculation.careerId);
      if (!career) {
        throw new Error(`Career not found for calculation ID ${calculation.id}`);
      }
      return { ...calculation, career };
    });
  }

  async getCareerCalculationsByUserAndCareer(userId: number, careerId: number): Promise<CareerCalculation[]> {
    if (!this.careerCalculations) {
      this.careerCalculations = new Map();
      return [];
    }
    
    return Array.from(this.careerCalculations.values()).filter(
      (calculation) => calculation.userId === userId && calculation.careerId === careerId,
    );
  }

  async createCareerCalculation(insertCalculation: InsertCareerCalculation): Promise<CareerCalculation> {
    if (!this.careerCalculations) {
      this.careerCalculations = new Map();
    }
    
    const id = this.careerCalculationId++;
    const timestamp = new Date();
    const calculation: CareerCalculation = { ...insertCalculation, id, calculationDate: timestamp };
    this.careerCalculations.set(id, calculation);
    return calculation;
  }

  async updateCareerCalculation(id: number, data: Partial<InsertCareerCalculation>): Promise<CareerCalculation | undefined> {
    const calculation = await this.getCareerCalculation(id);
    if (!calculation) return undefined;
    
    const updatedCalculation = { ...calculation, ...data };
    this.careerCalculations.set(id, updatedCalculation);
    return updatedCalculation;
  }

  async deleteCareerCalculation(id: number): Promise<void> {
    if (this.careerCalculations) {
      this.careerCalculations.delete(id);
    }
  }
  
  async toggleCareerProjectionInclusion(id: number, userId: number): Promise<CareerCalculation | undefined> {
    const calculation = await this.getCareerCalculation(id);
    if (!calculation || calculation.userId !== userId) {
      return undefined;
    }
    
    // First reset all career calculations for this user
    const userCalculations = await this.getCareerCalculationsByUserId(userId);
    for (const calc of userCalculations) {
      if (calc.includedInProjection) {
        await this.updateCareerCalculation(calc.id, { includedInProjection: false });
      }
    }
    
    // Then set this specific calculation to true
    return await this.updateCareerCalculation(id, { includedInProjection: true });
  }

  // Assumption methods
  async getAssumption(id: number): Promise<Assumption | undefined> {
    return this.assumptions.get(id);
  }

  async getAssumptionsByUserId(userId: number): Promise<Assumption[]> {
    return Array.from(this.assumptions.values()).filter(
      assumption => assumption.userId === userId
    );
  }

  async getAssumptionsByCategory(userId: number, category: string): Promise<Assumption[]> {
    return Array.from(this.assumptions.values()).filter(
      assumption => assumption.userId === userId && assumption.category === category
    );
  }

  async createAssumption(insertAssumption: InsertAssumption): Promise<Assumption> {
    const id = this.assumptionId++;
    const assumption: Assumption = { ...insertAssumption, id };
    this.assumptions.set(id, assumption);
    return assumption;
  }

  async updateAssumption(id: number, data: Partial<InsertAssumption>): Promise<Assumption | undefined> {
    const assumption = await this.getAssumption(id);
    if (!assumption) return undefined;
    
    const updatedAssumption = { ...assumption, ...data };
    this.assumptions.set(id, updatedAssumption);
    return updatedAssumption;
  }

  async deleteAssumption(id: number): Promise<void> {
    this.assumptions.delete(id);
  }

  async initializeDefaultAssumptions(userId: number): Promise<Assumption[]> {
    const userAssumptions = defaultAssumptions.map(assumption => ({
      ...assumption,
      userId
    }));
    
    const results: Assumption[] = [];
    for (const assumptionData of userAssumptions) {
      const assumption = await this.createAssumption(assumptionData);
      results.push(assumption);
    }
    
    return results;
  }
}

export const storage = new MemStorage();
