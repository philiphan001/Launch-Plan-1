import { Pool } from 'pg';
import { PathwayResponse, InsertPathwayResponse } from '../../interfaces/pathwayResponse';

export class PostgresPathwayResponseStorage {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async createPathwayResponse(response: InsertPathwayResponse): Promise<PathwayResponse> {
        const result = await this.pool.query(
            `INSERT INTO pathway_responses (user_id, category, question, response)
             VALUES ($1, $2, $3, $4)
             RETURNING id, user_id as "userId", category, question, response, created_at as "createdAt"`,
            [response.userId, response.category, response.question, response.response]
        );
        return result.rows[0];
    }

    async getPathwayResponsesByUserId(userId: number): Promise<PathwayResponse[]> {
        const result = await this.pool.query(
            `SELECT id, user_id as "userId", category, question, response, created_at as "createdAt"
             FROM pathway_responses
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    async getPathwayResponse(id: number): Promise<PathwayResponse | null> {
        const result = await this.pool.query(
            `SELECT id, user_id as "userId", category, question, response, created_at as "createdAt"
             FROM pathway_responses
             WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async updatePathwayResponse(id: number, response: string): Promise<PathwayResponse> {
        const result = await this.pool.query(
            `UPDATE pathway_responses
             SET response = $2
             WHERE id = $1
             RETURNING id, user_id as "userId", category, question, response, created_at as "createdAt"`,
            [id, response]
        );
        return result.rows[0];
    }

    async deletePathwayResponse(id: number): Promise<void> {
        await this.pool.query(
            'DELETE FROM pathway_responses WHERE id = $1',
            [id]
        );
    }
} 