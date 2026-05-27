import { useState } from 'react';
import { Plus, X, Eye, Edit2, Save, FileText, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface SnippetFormProps {
  onSave: (newSnippet: { title: string; bodyText: string; languageTags: string[] }) => void;
}

export default function SnippetForm({ onSave }: SnippetFormProps) {
  const [title, setTitle] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  
  // 1. REVISION: Split inputs instead of one massive markdown box
  const [summaryNote, setSummaryNote] = useState<string>('');
  const [rawCodeBlock, setRawCodeBlock] = useState<string>('');
  const [primaryLanguage, setPrimaryLanguage] = useState<string>('javascript');

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // 2. REVISION: Combining split states into a standardized Markdown string
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
      // Smart default: if the user types 'cpp' or 'java' as a tag, auto-set the code language drop-down
      if (['cpp', 'javascript', 'typescript', 'python', 'sql', 'java', 'html', 'css'].includes(cleanTag)) {
        setPrimaryLanguage(cleanTag);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
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

    // Compile everything into the structured markdown block expected by our view engine
    const finalBodyText = buildCombinedMarkdown();

    onSave({ 
      title, 
      bodyText: finalBodyText, 
      languageTags: tags.length > 0 ? tags : [primaryLanguage] 
    });
    
    // Reset Form
    setTitle('');
    setSummaryNote('');
    setRawCodeBlock('');
    setTags([]);
    setActiveTab('edit');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg max-w-2xl w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Add New Snippet</h2>
          <p className="text-xs text-slate-400 mt-0.5">Paste raw info; formatting is completely automated.</p>
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

      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Metadata: Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Snippet Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., C++ Reference Variables vs Pointers"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Metadata: Tags and Language Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Categorization Tags</label>
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Code Syntax Highlighter Language</label>
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

          {/* Display active tags if available */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-500 hover:text-red-400 transition-colors ml-0.5">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Split Input 1: The Plain Text Note Summary */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-400" /> 1. Concept Rule or Summary Note (Plain Text)
            </label>
            <textarea
              value={summaryNote}
              onChange={(e) => setSummaryNote(e.target.value)}
              rows={3}
              placeholder="Type out what your brain needs to remember. No markdown markdown headers required..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Split Input 2: The Raw Code Block */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Code size={14} className="text-emerald-400" /> 2. Code Block (Just paste code, no backticks needed!)
            </label>
            <textarea
              value={rawCodeBlock}
              onChange={(e) => setRawCodeBlock(e.target.value)}
              rows={5}
              placeholder={`// Paste your raw snippet here directly, e.g.:\nconst variable = true;`}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500 transition-colors resize-y"
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
        /* Preview Tab Engine */
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 min-h-[320px]">
          {title || summaryNote || rawCodeBlock ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{title || "Untitled Snippet"}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-4">
                {tags.map(tag => (
                  <span key={tag} className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
              <div className="text-sm text-slate-300 border-t border-slate-800/80 pt-3">
                <ReactMarkdown
                  components={{
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
                  {buildCombinedMarkdown() || "*Drafting...*"}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center italic mt-28">Fill out the split boxes to watch the live compilation render here!</p>
          )}
        </div>
      )}
    </div>
  );
}