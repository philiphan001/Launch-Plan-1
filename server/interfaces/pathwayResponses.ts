export interface PathwayResponse {
    id: number;
    userId: number;
    category: string;
    question: string;
    response: string;
    createdAt: Date;
}

export interface InsertPathwayResponse {
    userId: number;
    category: string;
    question: string;
    response: string;
} 