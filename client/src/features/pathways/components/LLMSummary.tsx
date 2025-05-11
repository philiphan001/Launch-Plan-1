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
    <div className={className}>
      {loading ? (
        <p>Loading LLM summary…</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <h3>AI Summary</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{llmPrompt}</pre>
          {llmPrompt && (
            <div style={{ marginTop: '1em' }}>
              <h4>LLM Prompt (Raw)</h4>
              <pre style={{ background: '#f4f4f4', padding: '1em', borderRadius: '4px', overflowX: 'auto' }}>{llmPrompt}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
} 