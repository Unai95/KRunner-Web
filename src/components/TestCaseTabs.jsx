import { Check, Loader2, X } from 'lucide-react';
import { normalize } from '../lib/runnerUtils.js';

export function TestCaseTabs({ tests, results, activeId, onSelect }) {
  const statusFor = (test) => {
    const result = results[test.id];
    if (result === null) return 'running';
    if (!result) return 'idle';
    if (result.systemError) return 'failed';
    const compileFailed = result.compile && result.compile.code !== 0;
    const code = typeof result.run?.code === 'number' ? result.run.code : null;
    return !compileFailed && code === 0 && normalize(result.run?.stdout || '') === normalize(test.expected) ? 'passed' : 'failed';
  };

  return (
    <div className="test-tabs">
      {tests.map((test) => {
        const status = statusFor(test);
        return (
          <button key={test.id} className={`test-tab ${activeId === test.id ? 'active' : ''} ${status}`} onClick={() => onSelect(test.id)}>
            <span>{status === 'passed' ? <Check size={13} /> : status === 'failed' ? <X size={13} /> : status === 'running' ? <Loader2 className="spin" size={13} /> : null}</span>
            {test.name}
          </button>
        );
      })}
    </div>
  );
}
