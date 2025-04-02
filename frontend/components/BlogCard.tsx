import { Link, router } from "expo-router";
import { TouchableOpacity, View, Alert, Button } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { format } from "date-fns";
import { StyleSheet } from "react-native";
import { BlogPostCard } from "@/utils/types";
import { useAppContext } from "@/contexts/appcontext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBlogPost } from "@/utils/api";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useBlogContext } from "@/contexts/blogContext";

const BlogCard = ({ post }: { post: BlogPostCard }) => {
  const { user } = useAppContext();
  const { refetchHomePage, refetchProfilePage } = useBlogContext();
  const isAuthor = user?.username === post.username;

  const deleteMutation = useMutation({
    mutationFn: () => deleteBlogPost(post.id),
    onSuccess: () => {
      refetchHomePage();
      refetchProfilePage();
      showSuccessToast("Blog post deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      showErrorToast("Failed to delete blog post");
    },
  });

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  return (
    <View style={styles.cardContainer}>
      <Link href={`/blog/${post.id}`} asChild>
        <TouchableOpacity style={styles.card}>
          <ThemedView style={styles.cardContent}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              {post.title}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.authorTitle}>
              {post.username}
            </ThemedText>
            <ThemedText style={styles.cardMeta}>
              Published: {format(new Date(post.created_at), "MMM d, yyyy")}
            </ThemedText>
            {post.updated_at && (
              <ThemedText style={styles.cardMeta}>
                Updated: {format(new Date(post.updated_at), "MMM d, yyyy")}
              </ThemedText>
            )}
            <View style={styles.metaContainer}>
              <View style={styles.likeContainer}>
                <AntDesign name="message1" size={16} color="black" />
                <ThemedText style={styles.cardMeta}>
                  {post.comment_count}
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </TouchableOpacity>
      </Link>
      {isAuthor && (
        <View style={styles.actionButtons}>
          <Link href={`/blog/edit/${post.id}`} asChild>
            <TouchableOpacity style={styles.editButton}>
              <Feather name="edit" size={20} color="white" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Ionicons name="trash" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  card: {
    padding: 16,
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
  },
  authorTitle: {
    fontSize: 14,
    color: "#666",
  },
  cardMeta: {
    fontSize: 12,
    color: "black",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  editButton: {
    backgroundColor: "#0a7ea4",
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 4,
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
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});

export default BlogCard;
