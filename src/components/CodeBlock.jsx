import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, language = 'bash', title, maxHeight = '340px' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(typeof code === 'string' ? code : JSON.stringify(code, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formattedCode = typeof code === 'string' ? code : JSON.stringify(code, null, 2);

  return (
    <div className="code-container">
      <div className="code-header">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8' }}>
          {title || language}
        </span>
        <button
          className="btn-secondary"
          onClick={handleCopy}
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} color="#34d399" />
              <span style={{ color: '#34d399' }}>Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre 
        className="code-content" 
        style={{ maxHeight }}
      >
        <code>{formattedCode}</code>
      </pre>
    </div>
  );
}
