import { BlogPostCard } from "@/utils/types";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import BlogCard from "./BlogCard";
import { ActivityIndicator } from "react-native";
import { ThemedText } from "./ThemedText";

const BlogList = ({
  blogPosts,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  blogPosts: BlogPostCard[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) => {
  return (
    <View>
      {blogPosts.length === 0 ? (
        <ThemedText style={styles.noPostsText}>No blog posts found</ThemedText>
      ) : (
        <>
          {blogPosts.map((post: BlogPostCard) => (
            <BlogCard key={post.id} post={post} />
          ))}
          {hasNextPage && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator color="#0a7ea4" />
              ) : (
                <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadMoreButton: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loadMoreText: {
    color: "#0a7ea4",
    fontSize: 16,
    fontWeight: "600",
  },
  noPostsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default BlogList;
