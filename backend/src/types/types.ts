import { Request } from "express";

// Auth related types
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
}

// Blog related types
export interface BlogPost {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  username?: string;
  like_count?: number;
  comment_count?: number;
  user_liked?: boolean;
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
}

export interface UpdateBlogPostRequest {
  title: string;
  content: string;
}

export interface GetBlogPostsRequest {
  limit: number;
  offset: number;
  userId?: number;
  isProfilePage?: boolean;
}

export interface BlogComment {
  id: number;
  content: string;
  created_at: Date;
  user_id: number;
  post_id: number;
  username: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface GetCommentsRequest {
  limit: number;
  offset: number;
}
export interface AuthenticatedRequest extends Request {
  user: User;
}
