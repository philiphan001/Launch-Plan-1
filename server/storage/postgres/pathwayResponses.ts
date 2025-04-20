import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { pathwayResponses } from '@shared/schema';
import { PathwayResponse, InsertPathwayResponse } from '../../interfaces/pathwayResponses';

export class PostgresPathwayResponsesStorage {
    private db: PostgresJsDatabase;

    constructor(db: PostgresJsDatabase) {
        this.db = db;
    }

    async createPathwayResponse(response: InsertPathwayResponse): Promise<PathwayResponse> {
        const [result] = await this.db.insert(pathwayResponses)
            .values({
                userId: response.userId,
                responseData: response.responseData,
            })
            .returning();
        return result as PathwayResponse;
    }

    async getPathwayResponsesByUserId(userId: number): Promise<PathwayResponse[]> {
        const results = await this.db.select()
            .from(pathwayResponses)
            .where(eq(pathwayResponses.userId, userId))
            .orderBy(pathwayResponses.createdAt);
        return results as PathwayResponse[];
    }

    async getPathwayResponse(id: number): Promise<PathwayResponse | null> {
        const [result] = await this.db.select()
            .from(pathwayResponses)
            .where(eq(pathwayResponses.id, id))
            .limit(1);
        return result ? (result as PathwayResponse) : null;
    }

    async updatePathwayResponse(id: number, responseData: Record<string, any>): Promise<PathwayResponse> {
        const [result] = await this.db.update(pathwayResponses)
            .set({ responseData })
            .where(eq(pathwayResponses.id, id))
            .returning();
        return result as PathwayResponse;
    }

    async deletePathwayResponse(id: number): Promise<void> {
        await this.db.delete(pathwayResponses)
            .where(eq(pathwayResponses.id, id));
    }
} 