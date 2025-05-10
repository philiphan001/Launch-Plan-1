import { useEffect, useState } from 'react';

interface LLMSummaryProps {
  sessionId: string | null;
  analysisType?: string;
  className?: string;
}

export function LLMSummary({ sessionId, analysisType, className }: LLMSummaryProps) {
  const [llmPrompt, setLlmPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    fetch('/api/llm/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, analysis_type: analysisType }),
    })
      .then(res => res.json())
      .then(data => {
        setLlmPrompt(data.prompt || 'No summary available.');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to generate summary.');
        setLoading(false);
      });
  }, [sessionId, analysisType]);

  if (!sessionId) return null;

  return (
    <div className={className || ''}>
      <h3 className="font-semibold mb-1">AI Summary</h3>
      {loading ? (
        <div>Generating summary...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{llmPrompt}</pre>
      )}
    </div>
  );
} 