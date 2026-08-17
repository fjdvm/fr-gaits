export interface CommentData {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface StreamPostData {
  id: string;
  type: string;
  body: string | null;
  linkUrl: string | null;
  assignmentId: string | null;
  authorId: string;
  createdAt: string;
  classComments: CommentData[];
  privateThread?: CommentData[];
  privateThreadsByStudent?: Record<string, CommentData[]>;
}

export interface RosterStudent {
  id: string;
  email: string;
}
