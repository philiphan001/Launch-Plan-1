import { useEffect, useState } from 'react';
import { LLMSummary } from './LLMSummary';

interface SwipeSummaryProps {
  onContinue: () => void;
}

export default function SwipeSummary({ onContinue }: SwipeSummaryProps) {
  const [sessionId, setSessionId] = useState<string | null>(window.localStorage.getItem('swipe_session_id'));
  const [sessionResponses, setSessionResponses] = useState<Array<{ question_id: string; response_value: boolean; question_title: string; question_description: string; game_name: string; category: string; }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    fetch('/api/llm/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(res => res.json())
      .then(data => {
         console.log('SwipeSummary: sessionId', sessionId, 'backend response:', data);
         if (data.error) {
           // Only clear session if user is authenticated or error is not just empty responses
           if (data.error !== 'No responses recorded for this session.') {
             window.localStorage.removeItem('swipe_session_id');
             setSessionId(null);
           }
           setSessionResponses([]);
         } else if (data.responses && data.responses.length > 0) {
           setSessionResponses(data.responses);
         } else {
           // Only clear session if truly stale (e.g., backend says session is invalid)
           setSessionResponses([]);
         }
         setLoading(false);
      })
      .catch(err => {
         console.error('SwipeSummary: Error fetching session responses:', err);
         setError(err.message);
         setLoading(false);
      });
  }, [sessionId]);

  return (
    <div>
      {loading ? <p>Loading session responses…</p> : error ? <p>Error: {error}</p> : (
         <div>
           <h2>Session Responses (Session ID: {sessionId})</h2>
           {sessionResponses.length > 0 ? (
             <ul>
               {sessionResponses.map((resp, idx) => (
                 <li key={idx}>
                   <strong>Q: [{resp.category}] {resp.question_title} – {resp.question_description} (Game: {resp.game_name})</strong><br />
                   A: {resp.response_value ? "true" : "false"}
                 </li>
               ))}
             </ul>
           ) : (
             <p>No responses recorded for this session.</p>
           )}
         </div>
      )}
      <LLMSummary sessionId={sessionId} />
      <button onClick={onContinue} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Continue</button>
    </div>
  );
} 