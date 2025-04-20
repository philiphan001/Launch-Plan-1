export interface PathwayResponse {
    id: number;
    userId: number;
    responseData: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface InsertPathwayResponse {
    userId: number;
    responseData: Record<string, any>;
} 