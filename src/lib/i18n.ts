// Supported languages for the UI
export type AppLocale = "en" | "id" | "zh" | "ja" | "ar";

export const LOCALES: { id: AppLocale; flag: string; name: string }[] = [
  { id: "en", flag: "🇺🇸", name: "English" },
  { id: "id", flag: "🇮🇩", name: "Bahasa Indonesia" },
  { id: "zh", flag: "🇨🇳", name: "中文" },
  { id: "ja", flag: "🇯🇵", name: "日本語" },
  { id: "ar", flag: "🇸🇦", name: "العربية" },
];

export type Translations = {
  appTagline: string;
  codeReview: string;
  codeReviewDesc: string;
  language: string;
  analyzeCode: string;
  reviewing: string;
  recentReviews: string;
  clearHistory: string;
  noHistory: string;
  noHistoryDesc: string;
  awaitingCode: string;
  awaitingCodeDesc: string;
  reviewResult: string;
  reviewResultDesc: string;
  score: string;
  summary: string;
  detectedIssues: string;
  noIssues: string;
  suggestions: string;
  noSuggestions: string;
  refactoredCode: string;
  copy: string;
  copied: string;
  download: string;
  clearConfirm: string;
  errorLabel: string;
  placeholder: string;
  viewFullReport: string;
  backToReview: string;
  fullReportTitle: string;
  fullReportDesc: string;
  notFound: string;
  resetAnalysis: string;
  // GitHub integration
  githubReview: string;
  githubReviewDesc: string;
  githubUrlLabel: string;
  githubUrlPlaceholder: string;
  githubAnalyze: string;
  githubAnalyzing: string;
  githubFilesFound: string;
  githubNoFiles: string;
  githubRepoSummary: string;
  githubFileReviews: string;
  githubPrivateNote: string;
  githubTokenLabel: string;
  githubTokenPlaceholder: string;
  githubNavCode: string;
  githubNavGithub: string;
  statusCritical: string;
  statusWarning: string;
  statusGood: string;
};

const translations: Record<AppLocale, Translations> = {
  en: {
    appTagline: "Code smarter, not harder.",
    codeReview: "Code Review",
    codeReviewDesc: "Paste your code snippet below and let AI analyze its quality, find bugs, and suggest improvements.",
    language: "Language",
    analyzeCode: "Analyze Code",
    reviewing: "Reviewing...",
    recentReviews: "Recent Reviews",
    clearHistory: "Clear History",
    noHistory: "No review history yet.",
    noHistoryDesc: "Submit your first code snippet to see it here.",
    awaitingCode: "Awaiting your code",
    awaitingCodeDesc: "Submit a snippet to instantly receive an AI-powered code review.",
    reviewResult: "Review Result",
    reviewResultDesc: "AI-generated analysis and improvements",
    score: "Score",
    summary: "Summary",
    detectedIssues: "Detected Issues",
    noIssues: "No major issues found! 🎉",
    suggestions: "Suggestions for Improvement",
    noSuggestions: "Code looks great!",
    refactoredCode: "Refactored Code",
    copy: "Copy",
    copied: "Copied!",
    download: "Download JSON",
    clearConfirm: "Are you sure you want to clear your review history?",
    errorLabel: "Error",
    placeholder: "// Type or paste your code here...",
    viewFullReport: "View Full Report",
    backToReview: "Back to Review",
    fullReportTitle: "Full Review Report",
    fullReportDesc: "Complete AI analysis for your code snippet",
    notFound: "Review not found. It may have been cleared from history.",
    resetAnalysis: "New Analysis",
    githubReview: "GitHub Review",
    githubReviewDesc: "Enter a public GitHub repository URL to review all code files in the repo.",
    githubUrlLabel: "Repository URL",
    githubUrlPlaceholder: "https://github.com/owner/repo",
    githubAnalyze: "Analyze Repository",
    githubAnalyzing: "Analyzing...",
    githubFilesFound: "files analyzed",
    githubNoFiles: "No code files found in this repository.",
    githubRepoSummary: "Repository Summary",
    githubFileReviews: "File Reviews",
    githubPrivateNote: "Only public repositories are supported without a token.",
    githubTokenLabel: "GitHub Token (optional, for private repos)",
    githubTokenPlaceholder: "ghp_...",
    githubNavCode: "Code Review",
    githubNavGithub: "GitHub Review",
    statusCritical: "Critical",
    statusWarning: "Warning",
    statusGood: "Good",
  },
  id: {
    appTagline: "Review kode lebih cerdas.",
    codeReview: "Review Kode",
    codeReviewDesc: "Tempel kode kamu di bawah, biarkan AI menganalisis kualitasnya, mencari bug, dan memberikan saran perbaikan.",
    language: "Bahasa",
    analyzeCode: "Analisis Kode",
    reviewing: "Menganalisis...",
    recentReviews: "Riwayat Review",
    clearHistory: "Hapus Riwayat",
    noHistory: "Belum ada riwayat review.",
    noHistoryDesc: "Submit kode pertamamu untuk melihatnya di sini.",
    awaitingCode: "Menunggu kode kamu",
    awaitingCodeDesc: "Submit kode snippet untuk langsung mendapatkan review dari AI.",
    reviewResult: "Hasil Review",
    reviewResultDesc: "Analisis dan saran perbaikan dari AI",
    score: "Skor",
    summary: "Ringkasan",
    detectedIssues: "Masalah Terdeteksi",
    noIssues: "Tidak ada masalah besar ditemukan! 🎉",
    suggestions: "Saran Perbaikan",
    noSuggestions: "Kode sudah bagus!",
    refactoredCode: "Kode Hasil Refaktor",
    copy: "Salin",
    copied: "Tersalin!",
    download: "Unduh JSON",
    clearConfirm: "Apakah kamu yakin ingin menghapus riwayat review?",
    errorLabel: "Error",
    placeholder: "// Ketik atau tempel kode kamu di sini...",
    viewFullReport: "Lihat Laporan Lengkap",
    backToReview: "Kembali ke Review",
    fullReportTitle: "Laporan Review Lengkap",
    fullReportDesc: "Analisis AI lengkap untuk kode kamu",
    notFound: "Review tidak ditemukan. Mungkin sudah dihapus dari riwayat.",
    resetAnalysis: "Analisis Baru",
    githubReview: "Review GitHub",
    githubReviewDesc: "Masukkan URL repo GitHub publik untuk mereview semua file kode di dalamnya.",
    githubUrlLabel: "URL Repository",
    githubUrlPlaceholder: "https://github.com/owner/repo",
    githubAnalyze: "Analisis Repository",
    githubAnalyzing: "Menganalisis...",
    githubFilesFound: "file dianalisis",
    githubNoFiles: "Tidak ada file kode ditemukan di repository ini.",
    githubRepoSummary: "Ringkasan Repository",
    githubFileReviews: "Review Per File",
    githubPrivateNote: "Hanya repo publik yang didukung tanpa token.",
    githubTokenLabel: "GitHub Token (opsional, untuk repo private)",
    githubTokenPlaceholder: "ghp_...",
    githubNavCode: "Review Kode",
    githubNavGithub: "Review GitHub",
    statusCritical: "Kritis",
    statusWarning: "Peringatan",
    statusGood: "Bagus",
  },
  zh: {
    appTagline: "更智能地审查代码。",
    codeReview: "代码审查",
    codeReviewDesc: "在下方粘贴代码片段，让 AI 分析其质量，发现错误并提供改进建议。",
    language: "语言",
    analyzeCode: "分析代码",
    reviewing: "分析中...",
    recentReviews: "最近审查",
    clearHistory: "清除历史",
    noHistory: "暂无审查历史。",
    noHistoryDesc: "提交您的第一个代码片段，即可在此查看。",
    awaitingCode: "等待您的代码",
    awaitingCodeDesc: "提交代码片段，立即获得 AI 代码审查。",
    reviewResult: "审查结果",
    reviewResultDesc: "AI 生成的分析和改进建议",
    score: "评分",
    summary: "摘要",
    detectedIssues: "检测到的问题",
    noIssues: "未发现重大问题！🎉",
    suggestions: "改进建议",
    noSuggestions: "代码看起来很好！",
    refactoredCode: "重构代码",
    copy: "复制",
    copied: "已复制！",
    download: "下载 JSON",
    clearConfirm: "您确定要清除审查历史吗？",
    errorLabel: "错误",
    placeholder: "// 在此输入或粘贴您的代码...",
    viewFullReport: "查看完整报告",
    backToReview: "返回审查",
    fullReportTitle: "完整审查报告",
    fullReportDesc: "AI 对代码片段的完整分析",
    notFound: "未找到审查记录，可能已被清除。",
    resetAnalysis: "新分析",
    githubReview: "GitHub 审查",
    githubReviewDesc: "输入公开 GitHub 仓库 URL 以审查其中的所有代码文件。",
    githubUrlLabel: "仓库 URL",
    githubUrlPlaceholder: "https://github.com/owner/repo",
    githubAnalyze: "分析仓库",
    githubAnalyzing: "分析中...",
    githubFilesFound: "个文件已分析",
    githubNoFiles: "未在此仓库中找到代码文件。",
    githubRepoSummary: "仓库摘要",
    githubFileReviews: "文件审查",
    githubPrivateNote: "无令牌时仅支持公开仓库。",
    githubTokenLabel: "GitHub 令牌（可选，用于私有仓库）",
    githubTokenPlaceholder: "ghp_...",
    githubNavCode: "代码审查",
    githubNavGithub: "GitHub 审查",
    statusCritical: "严重问题",
    statusWarning: "警告",
    statusGood: "良好",
  },
  ja: {
    appTagline: "よりスマートにコードをレビュー。",
    codeReview: "コードレビュー",
    codeReviewDesc: "コードをここに貼り付け、AIが品質を分析してバグを見つけ、改善提案を行います。",
    language: "言語",
    analyzeCode: "コードを分析",
    reviewing: "レビュー中...",
    recentReviews: "最近のレビュー",
    clearHistory: "履歴を消去",
    noHistory: "レビュー履歴はまだありません。",
    noHistoryDesc: "最初のコードを送信すると、ここに表示されます。",
    awaitingCode: "コードを待っています",
    awaitingCodeDesc: "コードを送信してAIレビューを即座に受け取りましょう。",
    reviewResult: "レビュー結果",
    reviewResultDesc: "AIによる分析と改善提案",
    score: "スコア",
    summary: "概要",
    detectedIssues: "検出された問題",
    noIssues: "重大な問題は見つかりませんでした！🎉",
    suggestions: "改善提案",
    noSuggestions: "コードは素晴らしいです！",
    refactoredCode: "リファクタリング済みコード",
    copy: "コピー",
    copied: "コピーしました！",
    download: "JSONをダウンロード",
    clearConfirm: "レビュー履歴を消去してもよろしいですか？",
    errorLabel: "エラー",
    placeholder: "// コードをここに入力または貼り付けてください...",
    viewFullReport: "完全なレポートを表示",
    backToReview: "レビューに戻る",
    fullReportTitle: "完全なレビューレポート",
    fullReportDesc: "コードスニペットのAI分析レポート",
    notFound: "レビューが見つかりません。履歴から削除された可能性があります。",
    resetAnalysis: "新しい分析",
    githubReview: "GitHub レビュー",
    githubReviewDesc: "公開 GitHub リポジトリ URL を入力して、全ファイルをレビューします。",
    githubUrlLabel: "リポジトリ URL",
    githubUrlPlaceholder: "https://github.com/owner/repo",
    githubAnalyze: "リポジトリを分析",
    githubAnalyzing: "分析中...",
    githubFilesFound: "ファイル分析完了",
    githubNoFiles: "コードファイルが見つかりません。",
    githubRepoSummary: "リポジトリの概要",
    githubFileReviews: "ファイルレビュー",
    githubPrivateNote: "トークンなしでは公開リポジトリのみ対応しています。",
    githubTokenLabel: "GitHub トークン（プライベートリポ用）",
    githubTokenPlaceholder: "ghp_...",
    githubNavCode: "コードレビュー",
    githubNavGithub: "GitHub レビュー",
    statusCritical: "致命的",
    statusWarning: "警告",
    statusGood: "良好",
  },
  ar: {
    appTagline: "راجع الكود بذكاء أكثر.",
    codeReview: "مراجعة الكود",
    codeReviewDesc: "الصق الكود أدناه ودع الذكاء الاصطناعي يحلل جودته ويجد الأخطاء ويقترح تحسينات.",
    language: "اللغة",
    analyzeCode: "تحليل الكود",
    reviewing: "جارٍ المراجعة...",
    recentReviews: "المراجعات الأخيرة",
    clearHistory: "مسح السجل",
    noHistory: "لا يوجد سجل مراجعة بعد.",
    noHistoryDesc: "أرسل مقتطف الكود الأول لرؤيته هنا.",
    awaitingCode: "في انتظار الكود",
    awaitingCodeDesc: "أرسل مقتطفاً للحصول فوراً على مراجعة مدعومة بالذكاء الاصطناعي.",
    reviewResult: "نتيجة المراجعة",
    reviewResultDesc: "التحليل والتحسينات الناتجة من الذكاء الاصطناعي",
    score: "النتيجة",
    summary: "الملخص",
    detectedIssues: "المشكلات المكتشفة",
    noIssues: "لم تُعثر على مشكلات كبيرة! 🎉",
    suggestions: "اقتراحات للتحسين",
    noSuggestions: "الكود يبدو رائعاً!",
    refactoredCode: "الكود المُعاد هيكلته",
    copy: "نسخ",
    copied: "تم النسخ!",
    download: "تنزيل JSON",
    clearConfirm: "هل أنت متأكد من مسح سجل المراجعة؟",
    errorLabel: "خطأ",
    placeholder: "// اكتب أو الصق الكود هنا...",
    viewFullReport: "عرض التقرير الكامل",
    backToReview: "العودة إلى المراجعة",
    fullReportTitle: "تقرير المراجعة الكامل",
    fullReportDesc: "التحليل الكامل للذكاء الاصطناعي لمقتطف الكود",
    notFound: "لم يتم العثور على المراجعة. ربما تم مسحها من السجل.",
    resetAnalysis: "تحليل جديد",
    githubReview: "مراجعة GitHub",
    githubReviewDesc: "أدخل رابط مستودع GitHub عام لمراجعة جميع ملفات الكود.",
    githubUrlLabel: "رابط المستودع",
    githubUrlPlaceholder: "https://github.com/owner/repo",
    githubAnalyze: "تحليل المستودع",
    githubAnalyzing: "جاري التحليل...",
    githubFilesFound: "ملف تم تحليله",
    githubNoFiles: "لم يتم العثور على ملفات كود في هذا المستودع.",
    githubRepoSummary: "ملخص المستودع",
    githubFileReviews: "مراجعة الملفات",
    githubPrivateNote: "يدعم فقط المستودعات العامة بدون رمز.",
    githubTokenLabel: "رمز GitHub (اختياري)",
    githubTokenPlaceholder: "ghp_...",
    githubNavCode: "مراجعة الكود",
    githubNavGithub: "مراجعة GitHub",
    statusCritical: "حرج",
    statusWarning: "تحذير",
    statusGood: "جيد",
  },
};

export function getTranslations(locale: AppLocale): Translations {
  return translations[locale] ?? translations.en;
}
