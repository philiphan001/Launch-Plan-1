import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../server/db';
import { careerPaths } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fieldOfStudy } = req.query;

    // Build the query based on whether fieldOfStudy is provided
    const results = await db
      .select()
      .from(careerPaths)
      .where(fieldOfStudy ? eq(careerPaths.field_of_study, fieldOfStudy as string) : undefined)
      .orderBy(careerPaths.option_rank);

    return res.status(200).json(results);
  } catch (error) {
    console.error('[DEBUG] Error in career-paths API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 