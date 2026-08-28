import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SnippetCard, { type Snippet } from "./components/SnippetCard";
import SnippetForm from "./components/SnippetForm";
import ReviewSystem from "./components/ReviewSystem";
import AuthModal, { type UserData } from "./components/AuthModal";
import { Search, Tag } from "lucide-react";

export default function App() {
  const [view, setView] = useState<string>("dashboard");
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [reviewQueue, setReviewQueue] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);

  // Authentication State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("bitesize_token"));
  const [user, setUser] = useState<UserData | null>(() => {
    const saved = localStorage.getItem("bitesize_user");
    return saved ? JSON.parse(saved) : null;
  });

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:5050/api" : "https://bitesize-backend.onrender.com/api");

  const handleLogout = () => {
    localStorage.removeItem("bitesize_token");
    localStorage.removeItem("bitesize_user");
    setToken(null);
    setUser(null);
    setSnippets([]);
    setReviewQueue([]);
  };

  // Sync network state when tabs or search inputs change
  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    const authHeaders = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (view === "all-snippets") {
      setLoading(true);
      const url = `${API_BASE}/snippets?search=${encodeURIComponent(searchQuery)}&tag=${encodeURIComponent(selectedTag)}`;

      fetch(url, { headers: authHeaders })
        .then((res) => {
          if (res.status === 401 || res.status === 403) {
            handleLogout();
            throw new Error("Session expired");
          }
          return res.json();
        })
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setSnippets(data);
          }
        })
        .catch((err) =>
          console.error("Error synchronizing with production API layer:", err),
        )
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    } else if (view === "review-queue") {
      fetch(`${API_BASE}/review/daily`, { headers: authHeaders })
        .then((res) => {
          if (res.status === 401 || res.status === 403) {
            handleLogout();
            throw new Error("Session expired");
          }
          return res.json();
        })
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setReviewQueue(data);
          }
        })
        .catch((err) =>
          console.error(
            "Error loading active daily memory retention elements:",
            err,
          ),
        );
    }

    return () => {
      isMounted = false;
    };
  }, [API_BASE, view, searchQuery, selectedTag, token]);

  // 3. Save a fresh new snippet into Neon Postgres
  const handleCreateSnippet = async (newSnippetData: {
    title: string;
    bodyText: string;
    languageTags: string[];
  }) => {
    try {
      const authHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE}/snippets`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(newSnippetData),
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (res.ok) {
        setSearchQuery("");
        setSelectedTag("all");
        setView("all-snippets");
      }
    } catch (err) {
      console.error("Failed to commit new snippet entity data payload:", err);
    }
  };

  // 4. Send memory review performance scores up to server
  const handleProcessReviewRating = async (
    id: string,
    performanceRating: "easy" | "hard",
  ) => {
    try {
      const authHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE}/review/${id}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ performanceRating }),
      });

      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }

      if (res.ok) {
        setReviewQueue((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to update memory matrix metric indices:", err);
    }
  };

  const allUniqueTags = [
    "all",
    ...Array.from(new Set(snippets.flatMap((s) => s.languageTags || []))),
  ];

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen">
      {!token && (
        <AuthModal
          apiBase={API_BASE}
          onSuccess={(newToken, newUser) => {
            setToken(newToken);
            setUser(newUser);
            setView("dashboard");
          }}
        />
      )}

      <Sidebar currentView={view} setView={setView} user={user} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Workspace: <span className="text-blue-500 uppercase">{view}</span>
          </h1>
        </div>

        <div className="w-full flex justify-start items-start">
          {view === "dashboard" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl">
              <h2 className="text-xl font-bold mb-2">
                Welcome to BiteSize Workspace
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your micro-learning developer workspace is active. Your code
                snippets and flashcards are synchronized with your cloud
                database engine for spaced-repetition learning.
              </p>
            </div>
          )}

          {view === "all-snippets" && (
            <div className="flex flex-col gap-6 w-full max-w-2xl">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-md">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-2.5 text-slate-500"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search cloud indexes using native PostgreSQL Full-Text Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <Tag size={14} className="text-slate-500 shrink-0" />
                  <div className="flex gap-1.5">
                    {allUniqueTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`text-xs font-mono px-2.5 py-1 rounded transition-colors whitespace-nowrap border ${
                          selectedTag === tag
                            ? "bg-blue-600 text-white border-blue-500"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {tag.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                {loading ? (
                  <p className="text-slate-500 italic text-sm animate-pulse">
                    Running advanced text index search across cloud indices...
                  </p>
                ) : snippets.length > 0 ? (
                  snippets.map((item) => (
                    <SnippetCard key={item.id} snippet={item} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-900/40 border border-slate-800 border-dashed rounded-xl">
                    <p className="text-slate-500 text-sm italic">
                      No snippets found matching your structural search matrix
                      fields.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "create-new" && (
            <SnippetForm onSave={handleCreateSnippet} />
          )}

          {view === "review-queue" && (
            <ReviewSystem
              queue={reviewQueue}
              onCompleteReview={handleProcessReviewRating}
            />
          )}
        </div>
      </main>
    </div>
  );
}
