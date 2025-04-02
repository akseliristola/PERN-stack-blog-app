import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAppContext } from "@/contexts/appcontext";
import { useMutation } from "@tanstack/react-query";
import { createBlogPost } from "@/utils/api";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import { useBlogContext } from "@/contexts/blogContext";

export default function NewBlogPostScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {}
  );
  const { user } = useAppContext();
  const { refetchHomePage, refetchProfilePage } = useBlogContext();

  const createPostMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createBlogPost(title, content),
    onSuccess: () => {
      refetchHomePage();
      refetchProfilePage();
      showSuccessToast("Blog post created successfully");
      setTitle("");
      setContent("");
      setErrors({});
      router.back();
    },
    onError: (error) => {
      console.error(error);
      showErrorToast("Failed to create blog post");
    },
  });

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      createPostMutation.mutate({ title, content });
    }
  };
  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>
          You need to be logged in to write a post
        </ThemedText>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/profile")}
        >
          <ThemedText style={styles.buttonText}>Login</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.form}>
          <ThemedText type="title" style={styles.title}>
            Write new post
          </ThemedText>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) {
                setErrors({ ...errors, title: undefined });
              }
            }}
            placeholder="Enter post title"
            placeholderTextColor="#666"
          />
          {errors.title && (
            <ThemedText style={styles.errorText}>{errors.title}</ThemedText>
          )}
          <ThemedText style={styles.label}>Content</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.contentInput,
              errors.content && styles.inputError,
            ]}
            value={content}
            onChangeText={(text) => {
              setContent(text);
              if (errors.content) {
                setErrors({ ...errors, content: undefined });
              }
            }}
            placeholder="Write your blog post content here..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={10}
          />
          {errors.content && (
            <ThemedText style={styles.errorText}>{errors.content}</ThemedText>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={createPostMutation.isPending}
          >
            <ThemedText style={styles.buttonText}>
              {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
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
    padding: 16,
  },

  title: {
    textAlign: "center",
    marginTop: 22,
    marginBottom: 5,
  },
  form: {
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    marginBottom: 16,
    textAlign: "center",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
  },
});
