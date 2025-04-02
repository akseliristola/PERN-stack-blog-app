import { authMiddleware } from "../utils";
import express, { Request, Response } from "express";
import { db } from "../pg";
import {
  BlogPost,
  GetBlogPostsRequest,
  BlogComment,
  GetCommentsRequest,
  AuthenticatedRequest,
} from "../types/types";
export const blogRouter = express.Router();

//create new blog post
blogRouter.post(
  "/blog-post",
  authMiddleware,
  async (req: Request, res: Response<{ message: string }>) => {
    try {
      const { title, content } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      await db.query(
        "INSERT INTO blog_posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING id, title, created_at, updated_at, user_id",
        [title, content, userId]
      );

      res.json({ message: "Blog post created successfully" });
    } catch (error) {
      console.error("error creating blog post", error);
      res.status(500).json({ message: "Error creating blog post" });
    }
  }
);

//update existing blog post
blogRouter.put(
  "/blog-post/:id",
  authMiddleware,
  async (req: Request, res: Response<{ message: string }>) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      await db.query(
        "UPDATE blog_posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4",
        [title, content, id, userId]
      );

      res.json({ message: "Blog post updated successfully" });
    } catch (error) {
      console.error("error updating blog post", error);
      res.status(500).json({ message: "Error updating blog post" });
    }
  }
);

//delete existing blog post
blogRouter.delete(
  "/blog-post/:id",
  authMiddleware,
  async (req: Request, res: Response<{ message: string }>) => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      // Delete all comments for this post
      await db.query("DELETE FROM blog_post_comments WHERE post_id = $1", [id]);

      // Finally delete the blog post itself
      const result = await db.query(
        "DELETE FROM blog_posts WHERE id = $1 AND user_id = $2",
        [id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json({
        message: "Blog post and all associated data deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Error deleting blog post" });
    }
  }
);

//get blog post cards
blogRouter.post(
  "/get-blog-posts",
  async (
    req: Request<{}, {}, GetBlogPostsRequest>,
    res: Response<BlogPost[] | { message: string }>
  ) => {
    try {
      const { limit, offset, userId, isProfilePage } = req.body;

      if (!userId && isProfilePage) {
        return res.status(400).json([]);
      }
      const result = await db.query(
        `SELECT 
      blog_posts.id, 
      blog_posts.title, 
      blog_posts.created_at, 
      blog_posts.updated_at, 
      users.username,
      (SELECT COUNT(*) FROM blog_post_comments WHERE post_id = blog_posts.id) as comment_count
    FROM blog_posts 
    JOIN users ON blog_posts.user_id = users.id 
    ${isProfilePage ? "WHERE blog_posts.user_id = $3" : ""}
    ORDER BY blog_posts.created_at DESC 
    LIMIT $1 OFFSET $2`,
        [limit, offset, ...(userId ? [userId] : [])]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Error getting blog posts:", error);
      res.status(500).json({ message: "Error getting blog posts" });
    }
  }
);

//get blog post content by id
blogRouter.get(
  "/get-blog-post/:id",
  async (
    req: Request<{ id: string }>,
    res: Response<string | { message: string }>
  ) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT content
      FROM blog_posts 
      WHERE blog_posts.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(result.rows[0].content);
    } catch (error) {
      console.error("error getting blog post content", error);
      res.status(500).json({ message: "Error getting blog post content" });
    }
  }
);

//get blog post comments by id
blogRouter.get(
  "/blog-post/:id/get-comments",
  async (
    req: Request<{ id: string }, {}, GetCommentsRequest>,
    res: Response<BlogComment[] | { message: string }>
  ) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT blog_post_comments.*, users.username 
       FROM blog_post_comments 
       JOIN users ON blog_post_comments.user_id = users.id 
       WHERE post_id = $1 
       ORDER BY blog_post_comments.created_at DESC `,
        [id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("error getting blog post comments", error);
      res.status(500).json({ message: "Error getting blog post comments" });
    }
  }
);

// Add comment to a blog post
blogRouter.post(
  "/blog-post/:id/comment",
  authMiddleware,
  async (req: Request, res: Response<BlogComment | { message: string }>) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const result = await db.query(
        "INSERT INTO blog_post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at, user_id",
        [id, userId, content]
      );

      // Get username for the comment
      const userResult = await db.query(
        "SELECT username FROM users WHERE id = $1",
        [userId]
      );

      res.json({
        ...result.rows[0],
        username: userResult.rows[0].username,
      });
    } catch (error) {
      console.error("error adding comment", error);
      res.status(500).json({ message: "Error adding comment" });
    }
  }
);

// Delete a comment
blogRouter.delete(
  "/blog-post/:id/comment/:commentId",
  authMiddleware,
  async (req: Request, res: Response<{ message: string }>) => {
    try {
      const { id, commentId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const result = await db.query(
        "DELETE FROM blog_post_comments WHERE id = $1 AND post_id = $2 AND user_id = $3",
        [commentId, id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Comment not found" });
      }

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("error deleting comment", error);
      res.status(500).json({ message: "Error deleting comment" });
    }
  }
);
