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
  salaryData: {
    entryLevel: number;
    midCareer: number;
    experienced: number;
    topEarners: number;
  };
  skillsData: {
    name: string;
    importance: number;
  }[];
  timelineData: {
    year: number;
    milestone: string;
  }[];
  industryGrowthData: {
    year: number;
    growthRate: number;
  }[];
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
          content: "You are an enthusiastic career coach for high school students who makes career information exciting, relatable, and easy to understand. Use casual, engaging language with short sentences, interesting facts, and real-world examples that resonate with teenagers. Avoid dry, academic language."
        },
        {
          role: "user",
          content: `Hey! I need some fun and engaging info about being a ${careerTitle} that will really connect with high school students.
          ${description ? `Here's what we know: ${description}` : ''}
          
          Format your response as JSON with the following structure:
          {
            "education": "Write a short, engaging paragraph about education paths - make it conversational and exciting! Include specific degree options, alternative paths, and how long it typically takes. Mention any cool specializations.",
            
            "pathways": "Create a fun, motivating paragraph about career growth - from entry-level to expert. Include specific job titles at different stages and mention any exciting opportunities. Keep it upbeat and inspirational!",
            
            "dailyTasks": "Write a vivid, day-in-the-life style paragraph that helps students imagine themselves in this role. Use active language, specific examples, and mention both challenging and rewarding aspects.",
            
            "skillsNeeded": "Create an energetic paragraph about must-have skills - technical AND personal traits. Use examples that connect to teen experiences where possible. Make it positive but honest about what it takes to succeed!",
            
            "futureOutlook": "Write an optimistic but realistic paragraph about job prospects and emerging trends. Include interesting facts about growth rates and how technology might change this career. Make students feel excited about the future!",
            
            "relatedCareers": "Create a paragraph listing at least 5 related career options with brief explanations of how they connect. Present these as cool alternatives students might not have considered!",
            
            "salaryData": {
              "entryLevel": [entry-level salary as a number],
              "midCareer": [mid-career salary as a number],
              "experienced": [experienced salary as a number],
              "topEarners": [top earners salary as a number]
            },
            
            "skillsData": [
              {"name": "Skill 1", "importance": 95},
              {"name": "Skill 2", "importance": 90},
              {"name": "Skill 3", "importance": 85},
              {"name": "Skill 4", "importance": 80},
              {"name": "Skill 5", "importance": 75}
            ],
            
            "timelineData": [
              {"year": 0, "milestone": "Graduate high school"},
              {"year": 4, "milestone": "Complete bachelor's degree"},
              {"year": 5, "milestone": "First professional position"},
              {"year": 8, "milestone": "Mid-level position"},
              {"year": 15, "milestone": "Senior position"}
            ],
            
            "industryGrowthData": [
              {"year": 2024, "growthRate": current growth rate as number},
              {"year": 2025, "growthRate": projected growth rate},
              {"year": 2026, "growthRate": projected growth rate},
              {"year": 2027, "growthRate": projected growth rate},
              {"year": 2028, "growthRate": projected growth rate}
            ]
          }
          
          Make each text section around 3-5 sentences - punchy, interesting, and using active language that speaks directly to teens. Include actual data in the data sections for visualization. Don't use placeholder values.`
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
      relatedCareers: "Unable to fetch related careers information at this time.",
      salaryData: {
        entryLevel: 0,
        midCareer: 0,
        experienced: 0,
        topEarners: 0
      },
      skillsData: [],
      timelineData: [],
      industryGrowthData: []
    };
  }
}