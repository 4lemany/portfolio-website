export interface PaperAuthor {
  _id?: string;
  name: string;
  hidden?: boolean;
}

export interface PaperDetails {
  id: string; // arXiv ID e.g. "2410.xxxxx"
  title: string;
  summary: string;
  authors: PaperAuthor[];
  publishedAt: string;
  upvotes: number;
  discussionId?: string;
  projectPage?: string;
  githubRepo?: string;
  githubRepoAddedBy?: string;
  thumbnail?: string;
  mediaUrls?: string[];
  organization?: {
    _id?: string;
    name: string;
    fullname?: string;
    avatar?: string;
  };
}

export interface DailyPaperItem {
  paper: PaperDetails;
  title?: string;
  summary?: string;
  publishedAt?: string;
  thumbnail?: string;
  numComments?: number;
  mediaUrls?: string[];
  submittedBy?: {
    fullname?: string;
    name?: string;
    avatarUrl?: string;
  };
}

export type SortOption = "upvotes" | "recent";

export interface CachedDailyPapers {
  timestamp: number;
  dateKey: string;
  papers: DailyPaperItem[];
}
