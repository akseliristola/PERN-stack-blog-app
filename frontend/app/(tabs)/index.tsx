import { StyleSheet, ScrollView, RefreshControl, View } from "react-native";
import React, { useCallback, useState } from "react";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import BlogList from "@/components/BlogList";
import { useBlogContext } from "@/contexts/blogContext";

export default function HomeScreen() {
  const {
    homePagePosts,
    fetchHomePageNextPage,
    hasHomePageNextPage,
    isFetchingHomePageNextPage,
    refetchHomePage,
  } = useBlogContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetchHomePage();
    setRefreshing(false);
  }, [refetchHomePage]);

  return (
    <View style={styles.fullContainer}>
      <ThemedText type="title" style={styles.headerTitle}>
        Blog posts
      </ThemedText>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.container}>
          <BlogList
            blogPosts={homePagePosts}
            hasNextPage={hasHomePageNextPage}
            isFetchingNextPage={isFetchingHomePageNextPage}
            fetchNextPage={fetchHomePageNextPage}
          />
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 70,
  },
  headerTitle: {
    padding: 20,
    textAlign: "center",
    backgroundColor: "white",
    marginTop: 10,
  },
});
