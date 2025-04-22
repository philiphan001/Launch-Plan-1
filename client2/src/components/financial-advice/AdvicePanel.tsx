import React, { useState } from 'react';
import { FinancialAdvice } from '@/lib/financialAdvice';
import { AdviceAlert } from './AdviceAlert';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

interface AdvicePanelProps {
  advice: FinancialAdvice[];
  title?: string;
  showCount?: boolean;
}

export function AdvicePanel({ advice, title = "Financial Advice", showCount = true }: AdvicePanelProps) {
  const [dismissedAdvice, setDismissedAdvice] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  
  // Filter out dismissed advice
  const filteredAdvice = advice.filter(item => !dismissedAdvice.includes(item.id));
  
  // Count advice by severity
  const dangerCount = filteredAdvice.filter(item => item.severity === 'danger').length;
  const warningCount = filteredAdvice.filter(item => item.severity === 'warning').length;
  const successCount = filteredAdvice.filter(item => item.severity === 'success').length;
  
  // Handle dismissing advice
  const handleDismiss = (id: string) => {
    setDismissedAdvice([...dismissedAdvice, id]);
  };
  
  // If there's no advice after filtering, don't render anything
  if (filteredAdvice.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white border rounded-lg shadow-sm mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-medium text-lg">{title}</h3>
            
            {showCount && (
              <div className="ml-4 flex gap-2">
                {dangerCount > 0 && (
                  <Badge variant="destructive">{dangerCount}</Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-500">{warningCount}</Badge>
                )}
                {successCount > 0 && (
                  <Badge variant="secondary" className="bg-green-500">{successCount}</Badge>
                )}
              </div>
            )}
          </div>
          
          <CollapsibleTrigger className="p-1 rounded-full hover:bg-gray-100">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            {filteredAdvice.map((adviceItem) => (
              <AdviceAlert 
                key={adviceItem.id} 
                advice={adviceItem} 
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}