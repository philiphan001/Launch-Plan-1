import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AISummaryProps {
  summary: string;
}

export function AISummary({ summary }: AISummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>AI-Generated Insights</span>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Beta
          </Badge>
        </CardTitle>
        <CardDescription>Personalized analysis based on your profile and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          {summary.split('\n\n').map((paragraph, index) => (
            <p key={index} className={index === 0 ? '' : 'mt-4'}>
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 