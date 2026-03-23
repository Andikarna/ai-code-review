"use client";

import React, { useState } from "react";
import { Check, Clipboard, Download, Zap, Bug, Sparkles, MessageSquare } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Translations } from "@/lib/i18n";

export interface ReviewData {
  score: number;
  issues: string[];
  suggestions: string[];
  refactored_code: string;
  summary: string;
}

interface ReviewResultProps {
  data: ReviewData;
  language: string;
  t: Translations;
}

export function ReviewResult({ data, language, t }: ReviewResultProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-destructive bg-destructive/10 border-destructive/20";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.refactored_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "review-result.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t.reviewResult}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t.reviewResultDesc}</p>
        </div>

        <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 ${getScoreColor(data.score)}`}>
          <span className="text-3xl font-black leading-none">{data.score}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-1">{t.score}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-3 text-primary">
          <MessageSquare className="w-5 h-5" />
          {t.summary}
        </h3>
        <p className="text-sm leading-relaxed text-foreground/90">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4 text-destructive">
            <Bug className="w-5 h-5" />
            {t.detectedIssues}
          </h3>
          {data.issues.length > 0 ? (
            <ul className="space-y-3">
              {data.issues.map((issue, idx) => (
                <li key={idx} className="flex gap-3 text-sm items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                  <span className="text-muted-foreground">{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground italic p-4 bg-muted/30 rounded-md">{t.noIssues}</div>
          )}
        </div>

        {/* Suggestions */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4 text-yellow-500">
            <Sparkles className="w-5 h-5" />
            {t.suggestions}
          </h3>
          {data.suggestions.length > 0 ? (
            <ul className="space-y-3">
              {data.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-3 text-sm items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground italic p-4 bg-muted/30 rounded-md">{t.noSuggestions}</div>
          )}
        </div>
      </div>

      {/* Refactored Code */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm flex flex-col">
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2 text-primary text-sm">
            <Zap className="w-4 h-4" />
            {t.refactoredCode}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="inline-flex py-1 px-3 items-center gap-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
              {copied ? t.copied : t.copy}
            </button>
            <button
              onClick={downloadJson}
              title={t.download}
              className="inline-flex p-1 h-6 w-6 items-center justify-center text-xs font-medium rounded-md border text-muted-foreground hover:bg-muted transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="h-[400px]">
          <Editor
            height="100%"
            language={language}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            value={data.refactored_code}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
