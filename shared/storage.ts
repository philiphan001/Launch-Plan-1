import { 
  User, 
  College, 
  Career, 
  PathwayResponse,
  CostOfLivingData,
  WealthData,
  InsertCostOfLivingData,
  InsertWealthData
} from "./schema";

export interface IStorage {
  saveCostOfLivingData(data: InsertCostOfLivingData): Promise<CostOfLivingData>;
  saveWealthData(data: InsertWealthData): Promise<WealthData>;
  getCostOfLivingByZipCode(zipCode: string): Promise<CostOfLivingData | null>;
  getWealthDataByZipCode(zipCode: string): Promise<WealthData | null>;
} 