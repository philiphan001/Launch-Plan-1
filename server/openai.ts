import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface CareerInsightsResponse {
  education: string;
  pathways: string;
  dailyTasks: string;
  skillsNeeded: string;
  futureOutlook: string;
  relatedCareers: string;
}

export async function generateCareerInsights(
  careerTitle: string,
  description?: string
): Promise<CareerInsightsResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a career guidance expert who provides detailed and accurate information about career paths."
        },
        {
          role: "user",
          content: `Please provide detailed information about a career as a ${careerTitle}. 
          ${description ? `Here's a brief description: ${description}` : ''}
          
          Format your response as JSON with the following structure:
          {
            "education": "A paragraph about the education requirements and typical academic path",
            "pathways": "A paragraph about different career progression routes within this field",
            "dailyTasks": "A paragraph describing typical day-to-day responsibilities",
            "skillsNeeded": "A paragraph about key skills and competencies required",
            "futureOutlook": "A paragraph about job market trends and future outlook",
            "relatedCareers": "A paragraph listing and briefly describing related careers that might interest someone considering this path"
          }
          
          Ensure your response is factual, provides specific details, and is formatted exactly as requested.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in the response");
    }

    return JSON.parse(content) as CareerInsightsResponse;
  } catch (error) {
    console.error("Error generating career insights:", error);
    return {
      education: "Unable to fetch education information at this time.",
      pathways: "Unable to fetch career pathways information at this time.",
      dailyTasks: "Unable to fetch daily tasks information at this time.",
      skillsNeeded: "Unable to fetch skills information at this time.",
      futureOutlook: "Unable to fetch future outlook information at this time.",
      relatedCareers: "Unable to fetch related careers information at this time."
    };
  }
}