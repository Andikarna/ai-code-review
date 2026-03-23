"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Loader2, Play } from "lucide-react";
import { Translations } from "@/lib/i18n";

export const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "csharp", name: "C#" },
  { id: "cpp", name: "C++" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "php", name: "PHP" },
  { id: "ruby", name: "Ruby" },
  { id: "swift", name: "Swift" },
  { id: "kotlin", name: "Kotlin" },
  { id: "sql", name: "SQL" },
  { id: "html", name: "HTML" },
  { id: "css", name: "CSS" },
];

interface CodeEditorProps {
  code: string;
  language: string;
  onChangeCode: (code: string) => void;
  onChangeLanguage: (lang: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  t: Translations;
}

export function CodeEditor({ code, language, onChangeCode, onChangeLanguage, onSubmit, isLoading, t }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col h-full rounded-lg border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <select
          value={language}
          onChange={(e) => onChangeLanguage(e.target.value)}
          className="text-sm rounded-md border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={onSubmit}
          disabled={isLoading || !code.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-md transition-colors px-4 py-1.5 text-sm font-medium
            bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.reviewing}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {t.analyzeCode}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-[400px]">
        <Editor
          height="100%"
          language={language}
          theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => onChangeCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
          }}
          loading={
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          }
        />
      </div>
    </div>
  );
}
