import { PgStorage } from './pg-storage';
import type { IStorage } from '../shared/storage';

export const storage = new PgStorage();
export type { IStorage };
