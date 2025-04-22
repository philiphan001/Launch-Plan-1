export interface WheelOption {
  id: string;
  label: string;
  prompts: string[];
  color: string;
}

export const identityWheelOptions: WheelOption[] = [
  {
    id: 'values',
    label: 'Values',
    color: '#FF5757', // red
    prompts: [
      "What values are most important to you in life?",
      "How do these values influence your career choices?",
      "Which values would you want to see reflected in your work environment?"
    ]
  },
  {
    id: 'interests',
    label: 'Interests',
    color: '#FF9E3D', // orange
    prompts: [
      "What topics or subjects do you find most fascinating?",
      "What activities make you lose track of time?",
      "Which of your interests could translate into career skills?"
    ]
  },
  {
    id: 'skills',
    label: 'Skills',
    color: '#FFD449', // yellow
    prompts: [
      "What are your natural talents or abilities?",
      "What skills have you developed through experience?",
      "Which skills do you enjoy using the most?"
    ]
  },
  {
    id: 'personality',
    label: 'Personality',
    color: '#5CFF5C', // green
    prompts: [
      "How would you describe your personality?",
      "What environments bring out your best qualities?",
      "How does your personality influence your work style?"
    ]
  },
  {
    id: 'goals',
    label: 'Goals',
    color: '#4CACFF', // blue
    prompts: [
      "What are your short-term career goals?",
      "What are your long-term career aspirations?",
      "What would success look like to you?"
    ]
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    color: '#9D4EDD', // purple
    prompts: [
      "What kind of work-life balance do you want?",
      "What lifestyle factors are important to you?",
      "How do you want your career to support your lifestyle?"
    ]
  },
  {
    id: 'impact',
    label: 'Impact',
    color: '#FF7EB6', // pink
    prompts: [
      "How do you want to make a difference in the world?",
      "What kind of impact do you want to have on others?",
      "What legacy do you want to leave behind?"
    ]
  },
  {
    id: 'growth',
    label: 'Growth',
    color: '#7B61FF', // indigo
    prompts: [
      "How do you want to grow and develop?",
      "What challenges are you excited to take on?",
      "What learning opportunities are important to you?"
    ]
  }
]; 