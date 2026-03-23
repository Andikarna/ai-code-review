"use client";

import { Moon, Sun, Code2, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { LOCALES, AppLocale } from "@/lib/i18n";

interface HeaderProps {
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}

export function Header({ locale, onLocaleChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentLocale = LOCALES.find(l => l.id === locale);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="relative w-8 h-8 overflow-hidden rounded-lg border border-primary/20 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            AI Code Reviewer
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>{currentLocale?.flag}</span>
              <span className="hidden sm:inline text-muted-foreground">{currentLocale?.name}</span>
            </button>

            {open && (
              <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border bg-popover shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                {LOCALES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => { onLocaleChange(l.id); setOpen(false); }}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors
                      ${locale === l.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
