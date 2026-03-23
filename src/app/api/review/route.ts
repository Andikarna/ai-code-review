import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, language, locale } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 });
    }

    // Map locale codes to full language names for the AI prompt
    const localeNames: Record<string, string> = {
      en: "English",
      id: "Bahasa Indonesia",
      zh: "Simplified Chinese (中文)",
      ja: "Japanese (日本語)",
      ar: "Arabic (العربية)",
    };
    const responseLang = localeNames[locale] ?? "English";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an elite senior software engineer acting as an expert code reviewer. ` +
      `Analyze the provided code deeply. Detect all logical bugs, memory leaks, security flaws, and instances of bad practices (e.g., tight coupling, lack of abstraction, poor naming). ` +
      `Provide actionable suggestions for improvement, and a completely refactored version of the code that adheres to industry best practices. ` +
      `IMPORTANT: You MUST write ALL text fields (issues, suggestions, summary) entirely in ${responseLang}. Only the refactored_code field should remain as code. ` +
      `You MUST output exactly and ONLY a JSON object. Follow this exact schema:\n` +
      "{\n" +
      '  "score": <number between 0 and 100>,\n' +
      '  "issues": ["<specific problems found>"],\n' +
      '  "suggestions": ["<actionable suggestions>"],\n' +
      '  "refactored_code": "<fully refactored code snippet, no markdown>",\n' +
      '  "summary": "<short professional summary of findings>"\n' +
      "}";

    const userPrompt = `Please review this snippet of ${language} code:\n\n${code}`;

    // Use gemini-2.0-flash-exp for preview models or gemini-2.0-flash as stable
    const MODEL = "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
          },
        }),
      }
    );

    // Read body as text first to avoid empty-body parse errors
    const rawBody = await response.text();

    if (!response.ok) {
      let errorMsg = `Gemini API error ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(rawBody);
        errorMsg = errorData?.error?.message || errorMsg;
      } catch { }
      throw new Error(errorMsg);
    }

    if (!rawBody || rawBody.trim() === "") {
      throw new Error("Gemini returned an empty response. Please try again.");
    }

    const data = JSON.parse(rawBody);
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error("No text content in AI response. The model may have blocked the request.");
    }

    // Clean away any markdown fences the LLM might have added
    let cleanJson = textResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Try to extract outermost JSON object if extra text is present
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanJson = jsonMatch[0];

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      // Last resort: ask the model explicitly for JSON only on format error
      throw new Error("The AI returned a malformed response. Please try again.");
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process the code review";
    console.error("AI Code Review Server Error:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
