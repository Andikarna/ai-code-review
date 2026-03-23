"use client";

import { History, Trash2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Translations } from "@/lib/i18n";
import { ReviewData } from "@/components/review-result";

export type ReviewHistoryItem = {
  id: string;
  timestamp: string;
  language: string;
  snippet: string;
  score: number;
  result: ReviewData;
  locale: string;
};

interface HistorySidebarProps {
  history: ReviewHistoryItem[];
  onSelect: (id: string) => void;
  onClear: () => void;
  selectedId: string | null;
  t: Translations;
}

export function HistorySidebar({ history, onSelect, onClear, selectedId, t }: HistorySidebarProps) {
  const router = useRouter();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground border-r bg-muted/20">
        <History className="w-10 h-10 mb-4 opacity-20" />
        <p className="text-sm font-medium">{t.noHistory}</p>
        <p className="text-xs mt-1">{t.noHistoryDesc}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <History className="w-4 h-4" />
          {t.recentReviews}
        </h2>
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md"
          title={t.clearHistory}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-64 md:w-72">
        <div className="flex flex-col gap-1 p-2">
          {history.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg text-sm transition-all border
                ${selectedId === item.id ? "bg-primary/10 border-primary/20" : "border-transparent hover:bg-muted"}`}
            >
              {/* Score badge */}
              <div
                className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs cursor-pointer
                  ${item.score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    item.score >= 50 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                onClick={() => onSelect(item.id)}
              >
                {item.score}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(item.id)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">{item.language}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate font-mono bg-muted/50 px-1 py-0.5 rounded">
                  {item.snippet}
                </p>
              </div>

              {/* View full report button */}
              <button
                onClick={() => router.push(`/review/${item.id}`)}
                className="shrink-0 self-center p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                title={t.viewFullReport}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
