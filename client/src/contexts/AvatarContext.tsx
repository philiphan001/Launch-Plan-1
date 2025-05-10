import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@apollo/client';
import { GET_FINANCIAL_PROFILE } from '@/graphql/queries';

interface FinancialData {
  income: number;
  expenses: number;
  savings: number;
  debt: number;
  investmentReturns: number;
  financialGoals: {
    targetSavings: number;
    targetIncome: number;
    targetDebtReduction: number;
  };
}

interface AvatarContextType {
  mood: string;
  commentary: string;
  updateContext: (newMood: string, newCommentary: string) => void;
  financialData: FinancialData | null;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

// Default messages for different sections
const sectionMessages = {
  '/financial-projections': {
    happy: "Your financial projections look promising! Keep up the good work!",
    worried: "Let's review these numbers together. There might be some areas we can optimize.",
    neutral: "Looking at your financial projections. Would you like to explore different scenarios?",
  },
  '/career-explorer': {
    happy: "Great career choices! Your path looks well-planned.",
    worried: "Let's explore more options to find the perfect career fit.",
    neutral: "Ready to explore different career paths?",
  },
  '/college-discovery': {
    happy: "Excellent college choices! Your future looks bright.",
    worried: "Let's look at more options to find the right college for you.",
    neutral: "Time to discover your perfect college match!",
  },
  '/pathways': {
    happy: "Your pathway is well-structured! Keep going!",
    worried: "Let's review your pathway together to make sure it aligns with your goals.",
    neutral: "Ready to explore different pathways to success?",
  },
};

// Financial analysis messages
const financialAnalysisMessages = {
  excellent: {
    happy: "Your financial health is excellent! You're well on your way to achieving your goals.",
    neutral: "Your finances are in great shape. Keep up the good work!",
  },
  good: {
    happy: "Your financial situation is looking good! A few small adjustments could make it even better.",
    neutral: "Your finances are in good shape. Would you like to explore ways to optimize further?",
  },
  needsAttention: {
    worried: "Let's work on improving your financial situation. I can help you identify areas for improvement.",
    neutral: "There's room for improvement in your financial planning. Shall we review your options?",
  },
  critical: {
    worried: "Your financial situation needs immediate attention. Let's create a plan to get back on track.",
    neutral: "We should focus on improving your financial health. I'm here to help you make better decisions.",
  },
};

// Function to analyze financial health
const analyzeFinancialHealth = (data: FinancialData): 'excellent' | 'good' | 'needsAttention' | 'critical' => {
  const {
    income,
    expenses,
    savings,
    debt,
    investmentReturns,
    financialGoals
  } = data;

  // Calculate key metrics
  const savingsRate = (savings / income) * 100;
  const debtToIncomeRatio = (debt / income) * 100;
  const progressToSavingsGoal = (savings / financialGoals.targetSavings) * 100;
  const investmentReturnRate = (investmentReturns / savings) * 100;

  // Define thresholds
  const thresholds = {
    excellent: {
      savingsRate: 20,
      debtToIncomeRatio: 30,
      progressToSavingsGoal: 80,
      investmentReturnRate: 5
    },
    good: {
      savingsRate: 15,
      debtToIncomeRatio: 40,
      progressToSavingsGoal: 60,
      investmentReturnRate: 3
    },
    needsAttention: {
      savingsRate: 10,
      debtToIncomeRatio: 50,
      progressToSavingsGoal: 40,
      investmentReturnRate: 1
    }
  };

  // Score each metric
  let score = 0;
  if (savingsRate >= thresholds.excellent.savingsRate) score += 3;
  else if (savingsRate >= thresholds.good.savingsRate) score += 2;
  else if (savingsRate >= thresholds.needsAttention.savingsRate) score += 1;

  if (debtToIncomeRatio <= thresholds.excellent.debtToIncomeRatio) score += 3;
  else if (debtToIncomeRatio <= thresholds.good.debtToIncomeRatio) score += 2;
  else if (debtToIncomeRatio <= thresholds.needsAttention.debtToIncomeRatio) score += 1;

  if (progressToSavingsGoal >= thresholds.excellent.progressToSavingsGoal) score += 3;
  else if (progressToSavingsGoal >= thresholds.good.progressToSavingsGoal) score += 2;
  else if (progressToSavingsGoal >= thresholds.needsAttention.progressToSavingsGoal) score += 1;

  if (investmentReturnRate >= thresholds.excellent.investmentReturnRate) score += 3;
  else if (investmentReturnRate >= thresholds.good.investmentReturnRate) score += 2;
  else if (investmentReturnRate >= thresholds.needsAttention.investmentReturnRate) score += 1;

  // Determine overall health
  if (score >= 10) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 4) return 'needsAttention';
  return 'critical';
};

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMood] = useState('neutral');
  const [commentary, setCommentary] = useState('');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const location = useLocation();

  // Fetch financial data
  const { data: financialProfileData } = useQuery(GET_FINANCIAL_PROFILE);

  useEffect(() => {
    if (financialProfileData?.financialProfile) {
      setFinancialData(financialProfileData.financialProfile);
    }
  }, [financialProfileData]);

  // Function to determine mood and message based on context
  const determineContext = () => {
    const currentPath = location.pathname;
    const sectionMessage = sectionMessages[currentPath as keyof typeof sectionMessages] || sectionMessages['/pathways'];
    
    let currentMood = 'neutral';
    let currentCommentary = sectionMessage.neutral;

    // If we're on a financial page and have financial data, use financial analysis
    if (financialData && ['/financial-projections', '/number-playground'].includes(currentPath)) {
      const financialHealth = analyzeFinancialHealth(financialData);
      const financialMessage = financialAnalysisMessages[financialHealth];
      
      // Choose mood based on financial health
      if (financialHealth === 'excellent' || financialHealth === 'good') {
        currentMood = 'happy';
      } else if (financialHealth === 'critical') {
        currentMood = 'worried';
      }
      
      currentCommentary = financialMessage[currentMood as keyof typeof financialMessage] || financialMessage.neutral;
    } else {
      // Use section-specific messages for non-financial pages
      const moods = ['happy', 'worried', 'neutral'];
      currentMood = moods[Math.floor(Math.random() * moods.length)];
      currentCommentary = sectionMessage[currentMood as keyof typeof sectionMessage] || sectionMessage.neutral;
    }
    
    setMood(currentMood);
    setCommentary(currentCommentary);
  };

  // Update context when location or financial data changes
  useEffect(() => {
    determineContext();
  }, [location, financialData]);

  const updateContext = (newMood: string, newCommentary: string) => {
    setMood(newMood);
    setCommentary(newCommentary);
  };

  return (
    <AvatarContext.Provider value={{ mood, commentary, updateContext, financialData }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
} 