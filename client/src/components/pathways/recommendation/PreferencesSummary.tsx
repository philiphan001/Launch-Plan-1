import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PreferenceGroup } from '@/types/recommendation';

interface PreferencesSummaryProps {
  groupedPreferences: Record<string, PreferenceGroup>;
}

export function PreferencesSummary({ groupedPreferences }: PreferencesSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Preferences</CardTitle>
        <CardDescription>Here's a summary of your responses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedPreferences).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h3 className="font-medium text-lg">{category}</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Liked Column */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-600">Liked</h4>
                  <div className="space-y-2">
                    {items.liked.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center p-2 rounded-lg bg-green-50 border border-green-200"
                      >
                        <span className="text-2xl mr-2">{item.emoji}</span>
                        <span className="flex-1">{item.title}</span>
                      </div>
                    ))}
                    {items.liked.length === 0 && (
                      <div className="text-sm text-gray-500 italic">No items liked in this category</div>
                    )}
                  </div>
                </div>
                
                {/* Not Interested Column */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Not Interested</h4>
                  <div className="space-y-2">
                    {items.notInterested.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center p-2 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <span className="text-2xl mr-2">{item.emoji}</span>
                        <span className="flex-1">{item.title}</span>
                      </div>
                    ))}
                    {items.notInterested.length === 0 && (
                      <div className="text-sm text-gray-500 italic">No items marked as not interested in this category</div>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 