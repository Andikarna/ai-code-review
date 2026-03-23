"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AppLocale, getTranslations } from "@/lib/i18n";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import {
  Github, Search, Loader2, Code2, ChevronDown, ChevronUp,
  Bug, Sparkles, Star, FileCode2, AlertCircle, CheckCircle2,
  ExternalLink, BarChart3, FileText, Info
} from "lucide-react";

interface FileReview {
  path: string;
  score: number;
  notes: string;
  content: string;
}

interface GitHubReviewResult {
  repo: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  fileReviews: FileReview[];
  filesAnalyzed: number;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}
function getScoreBg(score: number) {
  if (score >= 80) return "bg-green-500/10 border-green-500/20 text-green-500";
  if (score >= 50) return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
  return "bg-red-500/10 border-red-500/20 text-red-500";
}
function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
        <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="6"
          strokeDasharray={`${progress} ${circumference}`}
          className={getScoreColor(score)}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center">
        <div className={`text-2xl font-black ${getScoreColor(score)}`}>{score}</div>
        <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">{getScoreLabel(score)}</div>
      </div>
    </div>
  );
}

export default function GitHubPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [locale, setLocale] = useLocalStorage<AppLocale>("ai-review-locale", "en");
  const t = getTranslations(locale);

  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GitHubReviewResult | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedFilePath(null);

    try {
      const res = await fetch("/api/github-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, token: token || undefined, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      setResult(data);
      if (data.fileReviews?.length > 0) {
        setSelectedFilePath(data.fileReviews[0].path);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedFile = useMemo(() => {
    return result?.fileReviews.find(f => f.path === selectedFilePath);
  }, [result, selectedFilePath]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header locale={locale} onLocaleChange={setLocale} />

      {/* Tab Navigation */}
      <div className="border-b bg-card sticky top-14 z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex justify-center gap-0">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Code2 className="w-4 h-4" />
            {t.githubNavCode}
          </button>
          <button
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-primary text-primary"
          >
            <Github className="w-4 h-4" />
            {t.githubNavGithub}
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Github className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.githubReview}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t.githubReviewDesc}</p>
          </div>
        </div>

        {/* Input Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.githubUrlLabel}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                  placeholder={t.githubUrlPlaceholder}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !repoUrl.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isLoading ? t.githubAnalyzing : t.githubAnalyze}
              </button>
            </div>
          </div>

          {/* Token toggle */}
          <div>
            <button
              onClick={() => setShowToken(!showToken)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {showToken ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {t.githubTokenLabel}
            </button>
            {showToken && (
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder={t.githubTokenPlaceholder}
                className="mt-2 w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {t.githubPrivateNote}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <span className="font-bold">{t.errorLabel}: </span>{error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl border bg-muted/30" />
            ))}
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Repo header */}
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h2 className="font-semibold">{result.repo}</h2>
                  <p className="text-xs text-muted-foreground">
                    {result.filesAnalyzed} {t.githubFilesFound}
                  </p>
                </div>
              </div>
              <a
                href={`https://github.com/${result.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                GitHub
              </a>
            </div>

            {/* Score + Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-6 rounded-xl border bg-card shadow-sm">
                <ScoreRing score={result.overallScore} />
                <p className="text-xs text-muted-foreground mt-2">Overall Score</p>
              </div>
              <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 text-primary mb-3">
                  <BarChart3 className="w-4 h-4" /> {t.githubRepoSummary}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90">{result.summary}</p>
              </div>
            </div>

            {/* Strengths, Issues, Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-green-500 mb-4">
                  <CheckCircle2 className="w-4 h-4" /> Strengths
                  <span className="ml-auto bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-full px-2 py-0.5">{result.strengths?.length ?? 0}</span>
                </h3>
                <ul className="space-y-2 text-wrap break-words">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-muted-foreground">
                      <Star className="w-3.5 h-3.5 shrink-0 text-green-500 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-destructive mb-4">
                  <Bug className="w-4 h-4" /> {t.detectedIssues}
                  <span className="ml-auto bg-destructive/10 text-destructive text-xs rounded-full px-2 py-0.5">{result.issues?.length ?? 0}</span>
                </h3>
                <ul className="space-y-2 text-wrap break-words">
                  {result.issues?.map((s, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-yellow-500 mb-4">
                  <Sparkles className="w-4 h-4" /> {t.suggestions}
                  <span className="ml-auto bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs rounded-full px-2 py-0.5">{result.suggestions?.length ?? 0}</span>
                </h3>
                <ul className="space-y-2 text-wrap break-words">
                  {result.suggestions?.map((s, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* File Reviews - Code Editor Style */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-primary" />
                  {t.githubFileReviews}
                  <span className="text-sm font-normal text-muted-foreground">({result.fileReviews?.length ?? 0} files)</span>
                </h3>
                {/* Category Summary */}
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-destructive" />
                    {result.fileReviews.filter(f => f.score < 50).length} {t.statusCritical}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-yellow-500" />
                    {result.fileReviews.filter(f => f.score >= 50 && f.score < 80).length} {t.statusWarning}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-green-500" />
                    {result.fileReviews.filter(f => f.score >= 80).length} {t.statusGood}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row h-[650px] rounded-xl border bg-card overflow-hidden shadow-sm">
                {/* File Sidebar */}
                <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r bg-muted/20 overflow-y-auto">
                  <div className="p-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider border-b bg-muted/30 flex justify-between items-center">
                    <span>File Explorer</span>
                    <span className="text-[9px] opacity-70">Sorted by Issue</span>
                  </div>
                  <div className="p-1 space-y-0.5">
                    {[...result.fileReviews]
                      .sort((a, b) => a.score - b.score)
                      .map((file) => {
                        const isCritical = file.score < 50;
                        const isWarning = file.score >= 50 && file.score < 80;
                        return (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFilePath(file.path)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-all group ${
                              selectedFilePath === file.path 
                              ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20" 
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            }`}
                          >
                            <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${getScoreBg(file.score)}`}>
                              {file.score}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 overflow-hidden">
                                <p className="text-xs font-semibold truncate font-mono">{file.path.split('/').pop()}</p>
                                {isCritical && <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" title="Critical" />}
                                {isWarning && <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-500" title="Warning" />}
                              </div>
                              <p className="text-[10px] opacity-60 truncate font-mono">{file.path.split('/').slice(0, -1).join('/')}</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-background overflow-hidden">
                  {selectedFile ? (
                    <>
                      {/* AI Review Notes Header */}
                      <div className={`p-4 border-b flex items-start gap-3 ${getScoreBg(selectedFile.score)} bg-opacity-5`}>
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider">AI Review Notes</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${getScoreBg(selectedFile.score)}`}>
                              Score: {selectedFile.score}
                            </span>
                          </div>
                          <p className="text-sm italic leading-relaxed text-foreground/90">{selectedFile.notes}</p>
                        </div>
                      </div>

                      {/* Code Editor */}
                      <div className="flex-1 min-h-0">
                        <Editor
                          height="100%"
                          language={selectedFile.path.split('.').pop()?.toLowerCase() || 'javascript'}
                          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                          value={selectedFile.content}
                          options={{
                            readOnly: true,
                            minimap: { enabled: true },
                            fontSize: 13,
                            fontFamily: "var(--font-mono)",
                            padding: { top: 16 },
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            lineNumbers: "on",
                            renderLineHighlight: "all",
                            scrollbar: {
                              vertical: "visible",
                              horizontal: "visible"
                            }
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/60 transition-opacity">
                      <FileText className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm">Select a file to view its review</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
