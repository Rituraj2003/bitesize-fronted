import  { useState } from 'react';
import Sidebar from './components/Sidebar';
import SnippetCard, { type Snippet } from './components/SnippetCard';
import SnippetForm from './components/SnippetForm';
import ReviewSystem from './components/ReviewSystem';
import {Search,Tag} from 'lucide-react';


export default function App() {
  // Master state tracking which screen the user is looking at
  const [view, setView] = useState<string>('dashboard');

  const [snippets, setSnippets] = useState<Snippet[]>([
    {
      id: "sample-1",
      title: "C++ unique_ptr Move Semantics",
      bodyText: "A `std::unique_ptr` cannot be copied because its copy constructor is deleted. Use `std::move` to transfer resource ownership:\n\n```cpp\n#include <memory>\n\nauto p1 = std::make_unique<int>(42);\n// auto p2 = p1; // COMPILE ERROR!\nauto p2 = std::move(p1); // Correct pattern\n```",
      languageTags: ["C++", "Memory Management", "Pointers"],
      timesReviewed: 4,
      lastReviewedDate: "2026-05-20T12:00:00.000Z"
    }
  ]);
  const API_BASE = "https://bitesize-backend.onrender.com/api";
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Gather all unique tags present across all snippets for the filter pill selection list
  const allUniqueTags = ['all', ...Array.from(new Set(snippets.flatMap(s => s.languageTags)))];

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          snippet.bodyText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || snippet.languageTags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateSnippet = (newSnippetData: { title: string; bodyText: string; languageTags: string[] }) => {
    const freshSnippet: Snippet = {
      id: `snippet-${Date.now()}`, // Simple programmatic mock string UID identification key
      title: newSnippetData.title,
      bodyText: newSnippetData.bodyText,
      languageTags: newSnippetData.languageTags,
      timesReviewed: 0,
      lastReviewedDate: new Date().toISOString()
    };

    setSnippets([freshSnippet, ...snippets]);
    setView('all-snippets'); // Automatically switch views to show updated results grid
  };

  const handleProcessReviewRating = (id: string, performanceRating: 'easy' | 'hard') => {
    setSnippets(snippets.map(snippet => {
      if (snippet.id === id) {
        return {
          ...snippet,
          // If easy, increment reviews count. If hard, reset counter to force frequent appearance
          timesReviewed: performanceRating === 'easy' ? snippet.timesReviewed + 1 : 0,
          lastReviewedDate: new Date().toISOString()
        };
      }
      return snippet;
    }));
  };

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen">
      {/* Sidebar Component */}
      <Sidebar currentView={view} setView={setView} />

      {/* Right Side Main Content Window */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Workspace: <span className="text-blue-500 uppercase">{view}</span>
          </h1>
        </div>

        {/* Dynamic Conditional Rendering router map logic */}
        <div className="w-full flex justify-start items-start">
          {view === 'dashboard' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl">
              <h2 className="text-xl font-bold mb-2">Welcome Back, Rituraj!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your frontend development workspace environment is fully operational. Tap **All Notes** to browse your knowledge index base, or trigger your **Daily Review** module to execute active recall sequences.
              </p>
            </div>
          )}

          {view === 'all-snippets' && (
            <div className="flex flex-col gap-6 w-full max-w-2xl">
              
              {/* Filter Interface Grid */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-md">
                {/* Search Bar Input Row */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search titles or raw source code fragments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Horizontal Category Filtering Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <Tag size={14} className="text-slate-500 shrink-0" />
                  <div className="flex gap-1.5">
                    {allUniqueTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`text-xs font-mono px-2.5 py-1 rounded transition-colors whitespace-nowrap border ${
                          selectedTag === tag
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {tag.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtered Results Presentation Grid */}
              <div className="flex flex-col gap-4 w-full">
                {filteredSnippets.length > 0 ? (
                  filteredSnippets.map(item => (
                    <SnippetCard key={item.id} snippet={item} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-900/40 border border-slate-800 border-dashed rounded-xl">
                    <p className="text-slate-500 text-sm italic">No snippets found matching your structural search matrix fields.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {view === 'create-new' && (
            <SnippetForm onSave={handleCreateSnippet} />
          )}

          {view === 'review-queue' && (
            <ReviewSystem 
              queue={snippets} // Passing full mock tracking store down to handle iteratively
              onCompleteReview={handleProcessReviewRating} 
            />
          )}
        </div>
      </main>
    </div>
  );
}