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
import { IStorage } from "./storage";
import { sql, eq } from "drizzle-orm";
import { db } from "./db";
import { costOfLiving, wealthData } from "./schema";

export class PostgresStorage implements IStorage {
  async saveCostOfLivingData(data: InsertCostOfLivingData): Promise<CostOfLivingData> {
    const result = await db.insert(costOfLiving)
      .values({
        zipCode: data.zipCode,
        housingCost: data.housingCost,
        utilitiesCost: data.utilitiesCost,
        transportationCost: data.transportationCost,
        groceriesCost: data.groceriesCost,
        healthcareCost: data.healthcareCost,
        miscCost: data.miscCost,
        totalCost: data.totalCost,
        costIndex: data.costIndex,
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async saveWealthData(data: InsertWealthData): Promise<WealthData> {
    const result = await db.insert(wealthData)
      .values({
        zipCode: data.zipCode,
        medianHouseholdIncome: data.medianHouseholdIncome,
        medianHomeValue: data.medianHomeValue,
        medianNetWorth: data.medianNetWorth,
        percentHighIncome: data.percentHighIncome,
        percentHomeowners: data.percentHomeowners,
        wealthIndex: data.wealthIndex,
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async getCostOfLivingByZipCode(zipCode: string): Promise<CostOfLivingData | null> {
    const result = await db.select()
      .from(costOfLiving)
      .where(eq(costOfLiving.zipCode, zipCode))
      .limit(1);
    return result[0] || null;
  }

  async getWealthDataByZipCode(zipCode: string): Promise<WealthData | null> {
    const result = await db.select()
      .from(wealthData)
      .where(eq(wealthData.zipCode, zipCode))
      .limit(1);
    return result[0] || null;
  }
} 