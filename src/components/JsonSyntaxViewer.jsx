import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function JsonSyntaxViewer({ data, title = 'JSON Response', maxHeight = '380px' }) {
  const [copied, setCopied] = useState(false);

  let rawJson = '';
  if (typeof data === 'string') {
    try {
      rawJson = JSON.stringify(JSON.parse(data), null, 2);
    } catch {
      rawJson = data;
    }
  } else {
    rawJson = JSON.stringify(data, null, 2) || '';
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Convert raw JSON string into syntax-highlighted HTML spans safely
  const highlightJson = (jsonStr) => {
    if (!jsonStr) return null;
    
    // Escape HTML characters
    const escaped = jsonStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Tokenize
    const highlighted = escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'syntax-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'syntax-key';
          } else {
            cls = 'syntax-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'syntax-boolean';
        } else if (/null/.test(match)) {
          cls = 'syntax-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );

    return <code dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="code-container">
      <div className="code-header">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#94a3b8' }}>
          {title}
        </span>
        <button
          className="btn-secondary"
          onClick={handleCopy}
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
          title="Copy JSON"
        >
          {copied ? (
            <>
              <Check size={13} color="#34d399" />
              <span style={{ color: '#34d399' }}>Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy JSON</span>
            </>
          )}
        </button>
      </div>
      <pre className="code-content" style={{ maxHeight }}>
        {highlightJson(rawJson)}
      </pre>
    </div>
  );
}
