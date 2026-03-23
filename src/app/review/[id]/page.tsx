"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bug, Sparkles, MessageSquare, Zap, Check, Clipboard, Download, Code2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { ReviewHistoryItem } from "@/components/history-sidebar";
import { AppLocale, getTranslations } from "@/lib/i18n";

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500 bg-green-500/10 border-green-500/20";
  if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  return "text-destructive bg-destructive/10 border-destructive/20";
}

function getScoreBg(score: number) {
  if (score >= 80) return "from-green-500/20 to-transparent";
  if (score >= 50) return "from-yellow-500/20 to-transparent";
  return "from-red-500/20 to-transparent";
}

function getScoreLabel(score: number) {
  if (score >= 80) return { text: "Excellent", color: "text-green-500" };
  if (score >= 60) return { text: "Good", color: "text-yellow-500" };
  if (score >= 40) return { text: "Needs Work", color: "text-orange-500" };
  return { text: "Poor", color: "text-destructive" };
}

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [item, setItem] = useState<ReviewHistoryItem | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [locale, setLocale] = useState<AppLocale>("en");

  useEffect(() => {
    const stored = localStorage.getItem("ai-code-review-history");
    const storedLocale = localStorage.getItem("ai-review-locale");
    if (storedLocale) {
      try { setLocale(JSON.parse(storedLocale)); } catch {}
    }
    if (stored) {
      const history: ReviewHistoryItem[] = JSON.parse(stored);
      const found = history.find(h => h.id === params.id);
      if (found) setItem(found);
      else setNotFound(true);
    } else {
      setNotFound(true);
    }
  }, [params.id]);

  const t = getTranslations(locale);

  const copyToClipboard = () => {
    if (!item) return;
    navigator.clipboard.writeText(item.result.refactored_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!item) return;
    const blob = new Blob([JSON.stringify(item.result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review-${item.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
        <Code2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">{t.notFound}</p>
        <button onClick={() => router.push("/")} className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          {t.backToReview}
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const { result, language } = item;
  const scoreLabel = getScoreLabel(result.score);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className={`bg-gradient-to-b ${getScoreBg(result.score)} border-b`}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t.backToReview}
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{t.fullReportTitle}</h1>
                <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-muted border">{language}</span>
              </div>
              <p className="text-muted-foreground text-sm">{t.fullReportDesc}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(item.timestamp).toLocaleString()}</p>
            </div>

            {/* Big Score */}
            <div className={`flex flex-col items-center p-6 rounded-2xl border-2 ${getScoreColor(result.score)} min-w-[120px]`}>
              <span className="text-5xl font-black leading-none">{result.score}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-70 mt-1">{t.score}</span>
              <span className={`text-sm font-semibold mt-1 ${scoreLabel.color}`}>{scoreLabel.text}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Summary */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
            <MessageSquare className="w-5 h-5" /> {t.summary}
          </h2>
          <p className="text-base leading-relaxed text-foreground/90">{result.summary}</p>
        </section>

        {/* Issues & Suggestions - Full Width side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Issues */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive mb-5">
              <Bug className="w-5 h-5" /> {t.detectedIssues}
              <span className="ml-auto text-sm font-normal bg-destructive/10 text-destructive rounded-full px-2.5 py-0.5">
                {result.issues.length}
              </span>
            </h2>
            {result.issues.length > 0 ? (
              <ol className="space-y-4">
                {result.issues.map((issue, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-destructive/15 text-destructive text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{issue}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm italic">{t.noIssues}</div>
            )}
          </section>

          {/* Suggestions */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-yellow-500 mb-5">
              <Sparkles className="w-5 h-5" /> {t.suggestions}
              <span className="ml-auto text-sm font-normal bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full px-2.5 py-0.5">
                {result.suggestions.length}
              </span>
            </h2>
            {result.suggestions.length > 0 ? (
              <ol className="space-y-4">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-muted-foreground">{suggestion}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm italic">{t.noSuggestions}</div>
            )}
          </section>
        </div>

        {/* Refactored Code - Full Width */}
        <section className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Zap className="w-5 h-5" /> {t.refactoredCode}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                {copied ? t.copied : t.copy}
              </button>
              <button
                onClick={downloadJson}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border text-muted-foreground hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" />
                {t.download}
              </button>
            </div>
          </div>
          <div className="h-[600px]">
            <Editor
              height="100%"
              language={item.language.toLowerCase().replace("#", "sharp")}
              theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
              value={result.refactored_code}
              options={{
                readOnly: true,
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: "on",
                padding: { top: 20, bottom: 20 },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
              }}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
