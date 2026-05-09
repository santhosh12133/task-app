import { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';

export default function AiAssistant({ onGenerate, onAsk, onPrioritize }) {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState('');

  async function runAction(action, actionKey) {
    if (!prompt.trim() && actionKey !== 'prioritize') {
      setAnswer('Enter a prompt first so the assistant has context.');
      return;
    }

    setLoading(actionKey);
    const response = await action();
    if (response) {
      setAnswer(response);
    }
    setLoading('');
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">AI assistant</p>
          <h3 className="mt-2 text-2xl font-black text-text">Daily productivity co-pilot</h3>
        </div>
        <Badge tone="blue">OpenAI ready</Badge>
      </div>

      <Textarea className="mt-5" placeholder="Ask for a schedule, motivation, or task breakdown" value={prompt} onChange={(event) => setPrompt(event.target.value)} />

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => runAction(async () => (await onGenerate(prompt)).suggestions?.join(' • ') || '', 'generate')} disabled={loading !== ''}>
          {loading === 'generate' ? 'Generating...' : 'Generate tasks'}
        </Button>
        <Button variant="secondary" onClick={() => runAction(() => onAsk(prompt), 'ask')} disabled={loading !== ''}>
          {loading === 'ask' ? 'Thinking...' : 'Ask assistant'}
        </Button>
        <Button variant="secondary" onClick={() => runAction(() => onPrioritize(prompt), 'prioritize')} disabled={loading !== ''}>
          {loading === 'prioritize' ? 'Prioritizing...' : 'Prioritize'}
        </Button>
      </div>

      {answer ? (
        <div className="mt-5 rounded-3xl border border-accent/20 bg-accent/10 p-4 text-sm leading-7 text-text">
          {answer}
        </div>
      ) : null}
    </Card>
  );
}
