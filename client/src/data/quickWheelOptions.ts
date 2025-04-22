export interface WheelOption {
  id: string;
  label: string;
  prompts: string[];
  color: string;
}

export const quickWheelOptions: WheelOption[] = [
  {
    id: 'superpower',
    label: 'My Superpower',
    color: '#FF5757', // red
    prompts: [
      "What unique ability or talent do you have that others don't?",
      "How could this special skill help you in your future career?"
    ]
  },
  {
    id: 'ideal_day',
    label: 'My Ideal Day',
    color: '#FF9E3D', // orange
    prompts: [
      "Describe your perfect workday from morning to evening.",
      "What environment would you be working in?"
    ]
  },
  {
    id: 'values',
    label: 'What I Value',
    color: '#FFD449', // yellow
    prompts: [
      "What is most important to you in life?",
      "Which of these values would you want reflected in your career?"
    ]
  },
  {
    id: 'activities',
    label: 'What I Like to Do',
    color: '#5CFF5C', // green
    prompts: [
      "What activities make you lose track of time?",
      "Which of these could translate into career skills?"
    ]
  },
  {
    id: 'feelings',
    label: 'Future Feelings',
    color: '#4CACFF', // blue
    prompts: [
      "How do you want to feel at the end of each workday?",
      "What emotions do you want your career to bring you?"
    ]
  },
  {
    id: 'location',
    label: 'Dream Location',
    color: '#9D4EDD', // purple
    prompts: [
      "Where in the world would you like to live and work?",
      "What kind of setting energizes you: urban, rural, or something else?"
    ]
  },
  {
    id: 'team_role',
    label: 'My Role in a Team',
    color: '#FF7EB6', // pink
    prompts: [
      "Do you prefer leading, supporting, or working independently?",
      "What unique perspective do you bring to a group?"
    ]
  },
  {
    id: 'wildcard',
    label: 'Wildcard!',
    color: '#7B61FF', // indigo
    prompts: [
      "If you could have any job in the world regardless of qualifications, what would it be?",
      "What childhood dream job still appeals to you?"
    ]
  }
]; 