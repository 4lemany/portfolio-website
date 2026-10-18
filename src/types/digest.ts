export interface PodcastDialogue {
  speaker: string;
  text: string;
}

export interface DigestSlide {
  slideNumber: number;
  title: string;
  paperId?: string;
  paperTitle: string;
  keyPoints: string[];
  takeaway: string;
}

export interface DigestPaperItem {
  id: string;
  title: string;
  upvotes: number;
  authors: string[];
  publishedAt: string;
  hfUrl: string;
  pdfUrl: string;
  githubRepo?: string;
}

export interface WeeklyDigestData {
  weekTitle: string;
  dateRange: string;
  introduction: string;
  generatedAt: string;
  audioUrl: string;
  podcast: PodcastDialogue[];
  slides: DigestSlide[];
  papers: DigestPaperItem[];
}
