import { useLocalSearchParams, Stack } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { format } from "date-fns";

import { ThemedText } from "@/components/ThemedText";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  deleteComment,
  getBlogPostComments,
  getBlogPostContent,
} from "@/utils/api";
import { useAppContext } from "@/contexts/appcontext";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { Comment } from "@/utils/types";
import { useBlogContext } from "@/contexts/blogContext";

export default function BlogPostScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAppContext();
  const [newComment, setNewComment] = useState("");
  const {
    profilePagePosts,
    homePagePosts,
    refetchHomePage,
    refetchProfilePage,
  } = useBlogContext();

  const post =
    profilePagePosts.find((post) => post.id === id) ||
    homePagePosts.find((post) => post.id === id);

  const { data: postContent } = useQuery({
    queryKey: ["blogPost", id],
    queryFn: () => {
      try {
        return getBlogPostContent(id as string);
      } catch (error) {
        console.error(error);
        showErrorToast("Failed to get blog post content");
      }
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["blogPostComments", id],
    queryFn: () => getBlogPostComments(id as string),
  });

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      await createComment(id as string, newComment);
    },
    onSuccess: () => {
      refetchComments();
      refetchHomePage();
      refetchProfilePage();
      setNewComment("");
      showSuccessToast("Comment added successfully");
    },
    onError: () => {
      showErrorToast("Failed to add comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(id as string, commentId),
    onSuccess: () => {
      refetchComments();
      refetchHomePage();
      refetchProfilePage();
      showSuccessToast("Comment deleted successfully");
    },
    onError: () => {
      showErrorToast("Failed to delete comment");
    },
  });

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCommentMutation.mutate(commentId),
        },
      ]
    );
  };

  if (!post || !postContent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Blog Post",
        }}
      />
      <ScrollView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          {post.title}
        </ThemedText>
        <ThemedText style={styles.meta}>
          Published on {format(new Date(post.created_at), "MMM d, yyyy")}
        </ThemedText>
        {post.updated_at && (
          <ThemedText style={styles.meta}>
            Last updated on {format(new Date(post.updated_at), "MMM d, yyyy")}
          </ThemedText>
        )}
        <ThemedText style={styles.authorTitle}>
          Author: {post.username}
        </ThemedText>

        <ThemedText style={styles.content}>{postContent}</ThemedText>

        <View style={styles.commentsSection}>
          <ThemedText type="subtitle" style={styles.commentsTitle}>
            Comments ({post?.comment_count})
          </ThemedText>

          {user && (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Write a comment..."
                multiline
              />
              <TouchableOpacity
                style={styles.commentButton}
                onPress={() => createCommentMutation.mutate()}
                disabled={!newComment.trim() || createCommentMutation.isPending}
              >
                <ThemedText style={styles.commentButtonText}>Post</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {comments?.map((comment: Comment) => (
            <View key={comment.id} style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                <ThemedText style={styles.commentUsername}>
                  {comment.username}
                </ThemedText>
                <ThemedText style={styles.commentDate}>
                  {format(new Date(comment.created_at), "MMM d, yyyy")}
                </ThemedText>
              </View>
              <ThemedText style={styles.commentContent}>
                {comment.content}
              </ThemedText>
              {user?.username === comment.username && (
                <TouchableOpacity
                  style={styles.deleteCommentButton}
                  onPress={() => handleDeleteComment(comment.id)}
                >
                  <AntDesign name="delete" size={16} color="#dc3545" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    marginBottom: 8,
    marginTop: 16,
  },
  meta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 10,
    color: "black",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    marginTop: 15,
  },
  username: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 5,
    color: "black",
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeButton: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 1,
  },
  cardMeta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 5,
    color: "black",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  commentsSection: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  commentsTitle: {
    marginBottom: 16,
  },
  commentInputContainer: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 8,
  },
  commentButton: {
    backgroundColor: "#0a7ea4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  commentButtonText: {
    color: "white",
    fontWeight: "600",
  },
  commentContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    position: "relative",
    paddingBottom: 32,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  commentUsername: {
    fontWeight: "600",
  },
  commentDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteCommentButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  authorTitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
