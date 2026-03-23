import { NextResponse } from "next/server";

const CODE_EXTENSIONS = new Set([
  "js", "jsx", "ts", "tsx", "py", "java", "cs", "cpp", "c", "h",
  "go", "rs", "rb", "php", "swift", "kt", "scala", "vue", "svelte",
  "html", "css", "scss", "sass", "sql", "sh", "bash", "yml", "yaml",
  "json", "md", "toml", "xml",
]);

const SKIP_PATHS = [
  "node_modules", ".git", "dist", "build", ".next", "__pycache__",
  ".venv", "venv", "vendor", "coverage", ".nuxt", "out", "target",
  "bin", "obj", "packages", ".gradle", "Pods",
];

function shouldSkip(path: string) {
  return SKIP_PATHS.some(skip => path.split("/").includes(skip));
}

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function parseGitHubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+))?(?:\/|$)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], branch: match[3] || "main" };
}

export async function POST(req: Request) {
  try {
    const { repoUrl, token, locale } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub URL. Use: https://github.com/owner/repo" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const headers: Record<string, string> = {
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "AI-Code-Reviewer",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const { owner, repo: rawRepo } = parsed;
    const repo = rawRepo.replace(/\.git$/, ""); // Remove .git suffix if present

    // Fetch repository info to get the default branch
    const repoRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return NextResponse.json({ error: "Repository not found. Check if it's public or check your token." }, { status: 404 });
      }
      return NextResponse.json({ error: `GitHub API error: ${repoRes.statusText}` }, { status: repoRes.status });
    }
    
    const repoData = await repoRes.json();
    const defaultBranch = parsed.branch || repoData.default_branch || "main";

    // Fetch the file tree for the default branch
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers }
    );

    if (!treeRes.ok) {
      return NextResponse.json({ error: `Could not fetch file tree for branch ${defaultBranch}.` }, { status: treeRes.status });
    }

    interface GitHubTreeItem {
      path: string;
      type: string;
      size?: number;
      url: string;
    }

    const treeData = await treeRes.json();

    // Filter to code files only, skip large files (>100KB, size in bytes)
    const codeFiles = (treeData.tree as GitHubTreeItem[]).filter(item =>
      item.type === "blob" &&
      !shouldSkip(item.path) &&
      CODE_EXTENSIONS.has(getExtension(item.path)) &&
      (item.size ?? 0) < 80000
    ).slice(0, 25); // Max 25 files

    if (codeFiles.length === 0) {
      return NextResponse.json({ error: "No suitable code files found in this repository." }, { status: 404 });
    }

    // Fetch file contents (parallel, max concurrency via Promise.all)
    const fileContents = await Promise.all(
      codeFiles.map(async (file) => {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
            { headers }
          );
          if (!res.ok) return null;
          const data = await res.json();
          const content = Buffer.from(data.content, "base64").toString("utf-8").slice(0, 10000);
          return { path: file.path, content };
        } catch (err: unknown) {
          // Log the error for debugging, but continue processing other files
          console.error(`Error fetching content for ${file.path}:`, err);
          return null;
        }
      })
    );

    const validFiles = fileContents.filter(Boolean) as { path: string; content: string }[];

    if (validFiles.length === 0) {
      return NextResponse.json({ error: "Could not read any file contents from the repository." }, { status: 400 });
    }

    // Map locale to language name
    const localeNames: Record<string, string> = {
      en: "English", id: "Bahasa Indonesia",
      zh: "Simplified Chinese", ja: "Japanese", ar: "Arabic",
    };
    const responseLang = localeNames[locale] ?? "English";

    // Build a combined prompt with all files
    const fileSnippets = validFiles.map(f =>
      `### File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``
    ).join("\n\n");

    const systemPrompt = `You are a senior software architect conducting a comprehensive code review of an entire GitHub repository.
Analyze all the provided files holistically. Look for:
- Overall architecture and design patterns
- Code quality and consistency
- Security vulnerabilities
- Performance issues
- Best practice violations
- Code duplication and coupling

NOTE: Some files may be truncated (cut off) due to character limits. DO NOT flag a file as having a "bug" or "broken syntax" just because it appears to be cut off at the end. Focus on the logic that is present.

IMPORTANT: Write ALL text fields in ${responseLang}. 
You MUST output ONLY a valid JSON object with this exact schema:
{
  "repo": "${owner}/${repo}",
  "overallScore": <number 0-100>,
  "summary": "<overall assessment of the repository in 3-5 sentences>",
  "strengths": ["<list of positive aspects>"],
  "issues": ["<list of critical issues found across files>"],
  "suggestions": ["<actionable improvement suggestions>"],
  "fileReviews": [
    {
      "path": "<file path>",
      "score": <number 0-100>,
      "notes": "<brief 1-2 sentence review of this file. If the file is truncated, do not complain about it.>"
    }
  ]
}`;

    const userPrompt = `Please review this GitHub repository (${owner}/${repo}) with ${validFiles.length} files:\n\n${fileSnippets}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    const rawBody = await geminiRes.text();

    if (!geminiRes.ok) {
      let errorMsg = `Gemini API error ${geminiRes.status}`;
      try { errorMsg = JSON.parse(rawBody)?.error?.message || errorMsg; } catch {}
      throw new Error(errorMsg);
    }

    const geminiData = JSON.parse(rawBody);
    const textResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) throw new Error("No response from AI model.");

    let cleanJson = textResponse
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let resultJson: { 
      fileReviews?: Array<{
        path: string;
        score: number;
        notes: string;
        content?: string;
      }>;
      [key: string]: unknown;
    };
    try { resultJson = JSON.parse(cleanJson); }
    catch { throw new Error("AI returned malformed response. Please try again."); }

    // Re-attach content to file reviews for the UI
    if (resultJson.fileReviews && Array.isArray(resultJson.fileReviews)) {
      resultJson.fileReviews = resultJson.fileReviews.map((fr) => {
        const fileMatch = validFiles.find(f => f.path === fr.path);
        return {
          ...fr,
          content: fileMatch?.content || ""
        };
      });
    }

    return NextResponse.json({
      ...resultJson,
      filesAnalyzed: validFiles.length,
      totalFilesInRepo: codeFiles.length,
    }, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to analyze repository";
    console.error("GitHub Review Error:", err);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
