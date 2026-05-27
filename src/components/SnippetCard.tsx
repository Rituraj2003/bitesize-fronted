import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Calendar, Eye, EyeOff, CheckCircle } from 'lucide-react';

// 1. REVISION: Define explicit types for our Snippet Structure
export interface Snippet {
  id: string;
  title: string;
  bodyText: string;
  languageTags: string[];
  timesReviewed: number;
  lastReviewedDate: string;
}

interface SnippetCardProps {
  snippet: Snippet;
  onMarkReviewed?: (id: string) => void; // Optional callback
}

export default function SnippetCard({ snippet, onMarkReviewed }: SnippetCardProps) {
  // 2. REVISION: Local state toggle
  // Used to collapse/expand long code snippets or answers
  const [showBody, setShowBody] = useState<boolean>(true);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg max-w-2xl w-full transition-all hover:border-slate-700">
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 tracking-tight">
            {snippet.title}
          </h3>
          
          {/* Tags Mapping */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {snippet.languageTags.map((tag) => (
              <span 
                key={tag} 
                className="text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded"
              >
                {tag.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Visibility toggle button */}
        <button 
          onClick={() => setShowBody(!showBody)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title={showBody ? "Hide Content" : "Show Content"}
        >
          {showBody ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* 3. REVISION: Markdown & Syntax Rendering Conditional Area */}
      {showBody && (
        <div className="mt-4 border-t border-slate-800/60 pt-4 text-sm text-slate-300">
          <ReactMarkdown
            components={{
              // Custom code block wrapper rule
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="rounded-lg overflow-hidden my-3 border border-slate-800">
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, background: '#0f172a', padding: '1rem' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-slate-800 text-amber-400 font-mono text-xs px-1.5 py-0.5 rounded" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {snippet.bodyText}
          </ReactMarkdown>
        </div>
      )}

      {/* Bottom Metadata Action Row */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-slate-500" />
            Last: {new Date(snippet.lastReviewedDate).toLocaleDateString()}
          </span>
          <span className="bg-slate-800/60 px-2 py-0.5 rounded-full font-mono text-[11px]">
            Reviews: {snippet.timesReviewed}
          </span>
        </div>

        {onMarkReviewed && (
          <button
            onClick={() => onMarkReviewed(snippet.id)}
            className="flex items-center gap-1.5 text-emerald-400 font-medium hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-all"
          >
            <CheckCircle size={14} />
            Mark Reviewed
          </button>
        )}
      </div>

    </div>
  );
}