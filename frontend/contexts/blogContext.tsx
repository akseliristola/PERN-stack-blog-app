import React, { createContext, useContext } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getHomePageBlogPostCards,
  getProfilePageBlogPostCards,
} from "@/utils/api";
import { BlogPostCard, InfiniteBlogPosts } from "@/utils/types";
import { useAppContext } from "./appcontext";
import { showErrorToast } from "@/utils/toast";

const POSTS_PER_PAGE = 5;

//interface for the blog context
interface BlogContextType {
  homePagePosts: BlogPostCard[];
  profilePagePosts: BlogPostCard[];
  fetchHomePageNextPage: () => void;
  hasHomePageNextPage: boolean;
  isFetchingHomePageNextPage: boolean;
  fetchProfilePageNextPage: () => void;
  hasProfilePageNextPage: boolean;
  isFetchingProfilePageNextPage: boolean;
  refetchHomePage: () => void;
  refetchProfilePage: () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

//context for accessing the blog posts
export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAppContext();

  //fetch the blog posts for the home page
  const {
    data: homePageData,
    fetchNextPage: fetchHomePageNextPage,
    hasNextPage: hasHomePageNextPage,
    isFetchingNextPage: isFetchingHomePageNextPage,
    refetch: refetchHomePage,
  } = useInfiniteQuery<
    BlogPostCard[],
    Error,
    InfiniteBlogPosts,
    string[],
    number
  >({
    queryKey: ["blogPosts"],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam * POSTS_PER_PAGE;
      try {
        return getHomePageBlogPostCards(POSTS_PER_PAGE, offset);
      } catch (error) {
        console.log("error fetching home page blog posts", error);
        showErrorToast("Error fetching home page blog posts");
        return [];
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than POSTS_PER_PAGE, we've reached the end
      if (lastPage.length < POSTS_PER_PAGE) return undefined;
      // Return the next page number (current number of pages)
      return allPages.length;
    },
    initialPageParam: 0,
  });

  //fetch the blog posts for the profile page
  const {
    data: profilePageData,
    fetchNextPage: fetchProfilePageNextPage,
    hasNextPage: hasProfilePageNextPage,
    isFetchingNextPage: isFetchingProfilePageNextPage,
    refetch: refetchProfilePage,
  } = useInfiniteQuery<
    BlogPostCard[],
    Error,
    InfiniteBlogPosts,
    string[],
    number
  >({
    queryKey: ["userBlogPosts", user?.id ?? ""],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam * POSTS_PER_PAGE;
      try {
        return getProfilePageBlogPostCards(
          POSTS_PER_PAGE,
          offset,
          user?.id ?? ""
        );
      } catch (error) {
        console.log("error fetching profile page blog posts", error);
        showErrorToast("Error fetching profile page blog posts");
        return [];
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than POSTS_PER_PAGE, we've reached the end
      if (lastPage.length < POSTS_PER_PAGE) return undefined;
      // Return the next page number (current number of pages)
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: !!user,
  });

  const homePagePosts = homePageData?.pages.flat() ?? [];
  const profilePagePosts = profilePageData?.pages.flat() ?? [];

  const value = {
    homePagePosts,
    profilePagePosts,
    fetchHomePageNextPage,
    hasHomePageNextPage,
    isFetchingHomePageNextPage,
    fetchProfilePageNextPage,
    hasProfilePageNextPage,
    isFetchingProfilePageNextPage,
    refetchHomePage,
    refetchProfilePage,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlogContext must be used within an BlogProvider");
  }
  return context;
};
