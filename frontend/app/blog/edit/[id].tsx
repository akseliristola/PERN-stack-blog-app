import { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateBlogPost, getBlogPostContent } from "@/utils/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useBlogContext } from "@/contexts/blogContext";

export default function EditBlogPostScreen() {
  const { id } = useLocalSearchParams();
  const { profilePagePosts, refetchProfilePage, refetchHomePage } =
    useBlogContext();
  const post = profilePagePosts.find((post) => post.id === id);
  const [title, setTitle] = useState(post?.title);
  const [content, setContent] = useState("");

  const { data: initialContent } = useQuery({
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

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const updatePostMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      updateBlogPost(id as string, title, content),
    onSuccess: () => {
      refetchProfilePage();
      refetchHomePage();
      showSuccessToast("Blog post updated successfully");
      router.back();
    },
    onError: (error) => {
      console.error(error);
      showErrorToast("Failed to update blog post");
    },
  });

  const handleSubmit = async () => {
    if (!title || !content) {
      showErrorToast("Please fill in all fields");
      return;
    }
    updatePostMutation.mutate({ title, content });
  };

  if (!initialContent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Post" }} />
      <ScrollView style={styles.container}>
        <ThemedView style={styles.form}>
          <ThemedText type="title" style={styles.title}>
            Edit post
          </ThemedText>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter post title"
            placeholderTextColor="#666"
          />
          <ThemedText style={styles.label}>Content</ThemedText>
          <TextInput
            style={[styles.input, styles.contentInput]}
            value={content}
            onChangeText={setContent}
            placeholder="Write your blog post content here..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={10}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={updatePostMutation.isPending}
          >
            <ThemedText style={styles.buttonText}>
              {updatePostMutation.isPending ? "Updating..." : "Update Post"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  form: {
    padding: 16,
    gap: 8,
  },
  title: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  contentInput: {
    height: 200,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#0a7ea4",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
