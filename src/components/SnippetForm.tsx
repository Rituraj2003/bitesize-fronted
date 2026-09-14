import { useState, type ComponentPropsWithoutRef } from 'react';
import { Plus, X, Eye, Edit2, Save, FileText, Code, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SnippetFormProps {
  onSave: (newSnippet: { title: string; bodyText: string; languageTags: string[] }) => void;
  apiBase?: string;
  token?: string | null;
}

type CodeProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
};

export default function SnippetForm({ onSave, apiBase, token }: SnippetFormProps) {
  const [title, setTitle] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [summaryNote, setSummaryNote] = useState<string>('');
  const [rawCodeBlock, setRawCodeBlock] = useState<string>('');
  const [primaryLanguage, setPrimaryLanguage] = useState<string>('javascript');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<{ message: string; isError?: boolean } | null>(null);

  const buildCombinedMarkdown = (): string => {
    let combined = '';
    if (summaryNote.trim()) {
      combined += `### Core Concept\n${summaryNote.trim()}\n\n`;
    }
    if (rawCodeBlock.trim()) {
      combined += `\`\`\`${primaryLanguage}\n${rawCodeBlock.trim()}\n\`\`\``;
    }
    return combined;
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
      if (['cpp', 'javascript', 'typescript', 'python', 'sql', 'java', 'html', 'css'].includes(cleanTag)) {
        setPrimaryLanguage(cleanTag);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAiSummarize = async () => {
    if (!rawCodeBlock.trim()) {
      alert('Please paste a code block first so the AI can analyze it!');
      return;
    }

    setAiLoading(true);
    setAiStatus(null);

    try {
      const endpoint = apiBase ? `${apiBase}/ai/explain` : '/api/ai/explain';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: rawCodeBlock,
          language: primaryLanguage,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        let errMessage = 'AI analysis request failed';
        if (contentType && contentType.includes('application/json')) {
          const errData = await res.json();
          errMessage = errData.message || errMessage;
        }
        throw new Error(errMessage);
      }

      const data = await res.json();

      if (data.title && !title.trim()) {
        setTitle(data.title);
      }
      if (data.summary) {
        setSummaryNote(data.summary);
      }
      if (Array.isArray(data.tags) && data.tags.length > 0) {
        const normalizedTags = data.tags.map((t: string) => String(t).toLowerCase().trim());
        setTags((prev) => Array.from(new Set([...prev, ...normalizedTags])));
      }
      if (data.language) {
        const validLanguages = ['javascript', 'typescript', 'cpp', 'python', 'sql', 'java', 'bash'];
        const lang = String(data.language).toLowerCase();
        if (validLanguages.includes(lang)) {
          setPrimaryLanguage(lang);
        }
      }

      setAiStatus({
        message: data.isMockFallback
          ? '💡 Fallback concept note generated (Set GEMINI_API_KEY for live Gemini LLM)'
          : '✨ Gemini AI successfully summarized your code and extracted tags!',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate AI summary';
      setAiStatus({ message, isError: true });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please add a snippet title!');
      return;
    }
    if (!summaryNote.trim() && !rawCodeBlock.trim()) {
      alert('Please provide either a summary note or a code block!');
      return;
    }

    const finalBodyText = buildCombinedMarkdown();

    onSave({
      title,
      bodyText: finalBodyText,
      languageTags: tags.length > 0 ? tags : [primaryLanguage],
    });

    setTitle('');
    setSummaryNote('');
    setRawCodeBlock('');
    setTags([]);
    setAiStatus(null);
    setActiveTab('edit');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg max-w-2xl w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Add New Snippet</h2>
          <p className="text-xs text-slate-400 mt-0.5">Paste raw code or use Gemini AI for instant summarization.</p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit2 size={12} /> Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye size={12} /> Preview Look
          </button>
        </div>
      </div>

      {aiStatus && (
        <div
          className={`mb-4 text-xs p-3 rounded-lg border leading-relaxed ${
            aiStatus.isError
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          {aiStatus.message}
        </div>
      )}

      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Snippet Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., C++ Reference Variables vs Pointers"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Categorization Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g., pointers, frontend"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Code Syntax Highlighter Language
              </label>
              <select
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="java">Java</option>
                <option value="bash">Bash / Terminal</option>
              </select>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-500 hover:text-red-400 transition-colors ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code size={14} className="text-emerald-400" /> 1. Code Block (Paste code here)
              </label>
              <button
                type="button"
                onClick={handleAiSummarize}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-md transition-all disabled:opacity-50"
                title="Automatically analyze this code using Google Gemini AI"
              >
                <Sparkles size={13} className={aiLoading ? 'animate-spin text-amber-400' : 'text-amber-400'} />
                {aiLoading ? 'Analyzing Code...' : '✨ Auto-Summarize with AI'}
              </button>
            </div>
            <textarea
              value={rawCodeBlock}
              onChange={(e) => setRawCodeBlock(e.target.value)}
              rows={5}
              placeholder={`// Paste your raw snippet here directly, e.g.:\nconst variable = true;`}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500 transition-colors resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-400" /> 2. Concept Rule or Summary Note (Plain Text)
            </label>
            <textarea
              value={summaryNote}
              onChange={(e) => setSummaryNote(e.target.value)}
              rows={3}
              placeholder="Type out what your brain needs to remember, or click 'Auto-Summarize with AI' above..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
          >
            <Save size={16} /> Save Snippet
          </button>
        </form>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[320px]">
          {title || summaryNote || rawCodeBlock ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{title || 'Untitled Snippet'}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-slate-300 border-t border-slate-800/80 pt-3">
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
                    },
                  }}
                >
                  {buildCombinedMarkdown() || '*Drafting...*'}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center italic mt-28">
              Fill out the split boxes to watch the live compilation render here!
            </p>
          )}
        </div>
      )}
    </div>
  );
}