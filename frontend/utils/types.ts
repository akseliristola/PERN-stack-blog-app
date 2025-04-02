export type BlogPostCard = {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  username: string;
  comment_count: number;
};

export type InfiniteBlogPosts = {
  pages: BlogPostCard[][];
  pageParams: number[];
};

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  username: string;
};

export type BlogPost = BlogPostCard & {
  content: string;
  comments: Comment[];
};

export type User = {
  id: string;
  username: string;
  email: string;
  token: string;
};
