import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FinancialAdvice } from '@/lib/financialAdvice';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdviceAlertProps {
  advice: FinancialAdvice;
  onDismiss?: (id: string) => void;
}

export function AdviceAlert({ advice, onDismiss }: AdviceAlertProps) {
  // Determine alert variant and icon based on severity
  // Alert component only supports 'default' and 'destructive' variants
  const getAlertVariant = () => {
    switch (advice.severity) {
      case 'danger':
        return 'destructive';
      case 'warning':
      case 'success':
      default:
        return 'default';
    }
  };
  
  const getAlertIcon = () => {
    switch (advice.severity) {
      case 'danger':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <Alert variant={getAlertVariant()} className="mb-4 relative">
      {onDismiss && (
        <button 
          onClick={() => onDismiss(advice.id)} 
          className="absolute top-2 right-2 text-sm p-1 opacity-50 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
      <div className="flex items-start">
        <div className="mr-2">{getAlertIcon()}</div>
        <div>
          <AlertTitle>{advice.title}</AlertTitle>
          <AlertDescription className="mt-2">
            {advice.message}
            
            {advice.solution && (
              <div className="mt-2 font-medium">
                Recommendation: {advice.solution}
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}