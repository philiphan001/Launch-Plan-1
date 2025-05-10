import { LLMSummary } from './LLMSummary';

export default function SwipeSummary({ onContinue }: { onContinue: () => void }) {
  const sessionId = window.localStorage.getItem('swipe_session_id');
  return (
    <div>
      <LLMSummary sessionId={sessionId} />
      <button onClick={onContinue} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Continue</button>
    </div>
  );
} 