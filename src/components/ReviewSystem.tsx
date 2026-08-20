import { useState, type ComponentPropsWithoutRef } from 'react';
import type { Snippet } from './SnippetCard';
import { Eye, CheckCircle, RefreshCw, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ReviewSystemProps {
  queue: Snippet[];
  onCompleteReview: (id: string, performanceRating: 'easy' | 'hard') => void;
}

type CodeProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
};

export default function ReviewSystem({ queue, onCompleteReview }: ReviewSystemProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [revealed, setRevealed] = useState<boolean>(false);

  const isFinished = currentIndex >= queue.length;
  const currentSnippet = !isFinished ? queue[currentIndex] : null;

  const handleActionClick = (rating: 'easy' | 'hard') => {
    if (currentSnippet) {
      onCompleteReview(currentSnippet.id, rating);
      setRevealed(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (isFinished || queue.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-xl w-full text-center flex flex-col items-center justify-center min-h-80">
        <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-400 mb-4 animate-bounce">
          <Award size={40} />
        </div>
        <h3 className="text-xl font-bold text-slate-100 tracking-tight">Daily Review Complete!</h3>
        <p className="text-slate-400 text-sm mt-2 max-w-sm">
          Excellent work! Your brain has successfully processed your micro-learning requirements for today. Check back tomorrow for your next custom interval retrieval block.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-900/40 border border-slate-800/80 px-4 py-2 rounded-lg">
        <span>Active Retention Deck</span>
        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">
          Snippet {currentIndex + 1} of {queue.length}
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl transition-all">
        <div className="border-b border-slate-800 pb-4 mb-4">
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-blue-500">Core Topic Prompt</span>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5 tracking-tight">{currentSnippet?.title}</h2>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {currentSnippet?.languageTags.map(tag => (
              <span key={tag} className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {!revealed ? (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500 text-sm italic mb-4">Attempt to actively recall this code syntax or core concept rule block...</p>
            <button
              onClick={() => setRevealed(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-blue-600/10 transition-colors"
            >
              <Eye size={16} /> Reveal Snippet Core
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-300 bg-slate-950 border border-slate-800/80 rounded-xl p-4 animate-fadeIn">
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }: CodeProps) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="rounded-lg overflow-hidden my-3 border border-slate-800">
                      <SyntaxHighlighter
                        style={vscDarkPlus as unknown as { [key: string]: React.CSSProperties }}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, background: '#0f172a', padding: '1rem' }}
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
              {currentSnippet?.bodyText || ''}
            </ReactMarkdown>
          </div>
        )}

        {revealed && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="text-xs text-slate-500 italic">How effectively did your brain map this memory string structure?</p>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleActionClick('hard')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-medium text-xs px-3 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={14} /> Forgot / Review Soon
              </button>
              <button
                onClick={() => handleActionClick('easy')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium text-xs px-3 py-2 rounded-lg transition-colors"
              >
                <CheckCircle size={14} /> Easy / Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}