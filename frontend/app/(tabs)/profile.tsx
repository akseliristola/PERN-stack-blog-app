import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useState } from "react";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAppContext } from "@/contexts/appcontext";
import LoginScreen from "@/components/LoginMenu";

import BlogList from "@/components/BlogList";
import { useBlogContext } from "@/contexts/blogContext";

export default function ProfileScreen() {
  const { user, userIsLoading, setUser } = useAppContext();

  const {
    profilePagePosts,
    fetchProfilePageNextPage,
    hasProfilePageNextPage,
    isFetchingProfilePageNextPage,
    refetchProfilePage,
    refetchHomePage,
  } = useBlogContext();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetchProfilePage();
    setRefreshing(false);
  }, [refetchProfilePage]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
    refetchHomePage();
    refetchProfilePage();
  };

  if (userIsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.fullContainer}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          My profile
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <ThemedText style={styles.buttonText}>Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedText type="title" style={styles.myBlogPostsTitle}>
        Blog posts by {user.username}
      </ThemedText>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.container}>
          <BlogList
            blogPosts={profilePagePosts}
            hasNextPage={hasProfilePageNextPage}
            isFetchingNextPage={isFetchingProfilePageNextPage}
            fetchNextPage={fetchProfilePageNextPage}
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
    padding: 16,
    gap: 8,
    marginTop: 20,
    paddingBottom: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#0a7ea4",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  myBlogPostsTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
