"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { HistorySidebar, ReviewHistoryItem } from "@/components/history-sidebar";
import { CodeEditor, LANGUAGES } from "@/components/code-editor";
import { ReviewResult, ReviewData } from "@/components/review-result";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { nanoid } from "nanoid";
import { AppLocale, getTranslations } from "@/lib/i18n";
import { ExternalLink, RotateCcw, Github, Code2 } from "lucide-react";

const SESSION_KEY = "ai-review-active-result";
const SESSION_ID_KEY = "ai-review-active-id";

export default function Home() {
  const [locale, setLocale] = useLocalStorage<AppLocale>("ai-review-locale", "en");
  const t = getTranslations(locale);

  const [history, setHistory] = useLocalStorage<ReviewHistoryItem[]>("ai-code-review-history", []);

  const [code, setCode] = useState(`// Type your code here...
function calculateTotal(items) {
  var total = 0;
  for(var i=0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}
`);
  const [language, setLanguage] = useState("javascript");

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewData | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [lastReviewId, setLastReviewId] = useState<string | null>(null);

  // Restore result from sessionStorage after navigating back from detail page
  useEffect(() => {
    try {
      const savedResult = sessionStorage.getItem(SESSION_KEY);
      const savedId = sessionStorage.getItem(SESSION_ID_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
        setLastReviewId(savedId);
      }
    } catch {}
  }, []);

  const handleSubmit = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedHistoryId(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(data as ReviewData);

      const newId = nanoid();
      const newItem: ReviewHistoryItem = {
        id: newId,
        timestamp: new Date().toISOString(),
        language: LANGUAGES.find(l => l.id === language)?.name || language,
        snippet: code.slice(0, 50).replace(/\n/g, " ") + "...",
        score: parseInt((data as ReviewData).score as any, 10),
        result: data as ReviewData,
        locale,
      };

      setHistory((prev) => [newItem, ...prev].slice(0, 50));
      setLastReviewId(newId);

      // Persist to sessionStorage so navigating back preserves the result
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      sessionStorage.setItem(SESSION_ID_KEY, newId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setLastReviewId(null);
    setSelectedHistoryId(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_ID_KEY);
  };

  const handleClearHistory = () => {
    if (confirm(t.clearConfirm)) {
      setHistory([]);
      setSelectedHistoryId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header locale={locale} onLocaleChange={setLocale} />

      {/* Tab Navigation */}
      <div className="border-b bg-card shrink-0">
        <div className="flex justify-center gap-0 px-4 md:px-8">
          <button className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-primary text-primary">
            <Code2 className="w-4 h-4" />
            {t.githubNavCode}
          </button>
          <button
            onClick={() => router.push("/github")}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            {t.githubNavGithub}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-72 shrink-0 border-r">
          <HistorySidebar
            history={history}
            onClear={handleClearHistory}
            onSelect={setSelectedHistoryId}
            selectedId={selectedHistoryId}
            t={t}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Column: Input Editor */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">{t.codeReview}</h1>
                    <p className="text-muted-foreground text-sm">{t.codeReviewDesc}</p>
                  </div>
                </div>

                <div className="h-[500px]">
                  <CodeEditor
                    code={code}
                    language={language}
                    onChangeCode={setCode}
                    onChangeLanguage={setLanguage}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    t={t}
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    <span className="font-bold">{t.errorLabel}: </span>{error}
                  </div>
                )}
              </div>

              {/* Right Column: Result or Placeholder */}
              <div className="flex flex-col gap-3">
                {/* Reset + View Full Report buttons — shown only when there's a result */}
                {result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {t.resetAnalysis}
                    </button>
                    {lastReviewId && (
                      <button
                        onClick={() => router.push(`/review/${lastReviewId}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t.viewFullReport}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto rounded-lg border bg-muted/5 p-4 md:p-6" style={{ maxHeight: "calc(100vh - 14rem)" }}>
                  {result ? (
                    <ReviewResult data={result} language={language} t={t} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center text-muted-foreground/60 space-y-4">
                      <div className="p-6 rounded-full bg-muted/30">
                        <CodeIcon className="w-12 h-12" />
                      </div>
                      <div className="max-w-[250px]">
                        <p className="font-medium text-foreground/70">{t.awaitingCode}</p>
                        <p className="text-sm mt-1">{t.awaitingCodeDesc}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  );
}
