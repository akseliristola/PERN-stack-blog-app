import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:3000/api";

export const getHomePageBlogPostCards = async (
  limit: number,
  offset: number
) => {
  const response = await fetch(`${API_URL}/get-blog-posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit, offset, isProfilePage: false }),
  });
  if (!response.ok) {
    throw new Error("Failed to get home page blog post cards");
  }
  return response.json();
};

export const getProfilePageBlogPostCards = async (
  limit: number,
  offset: number,
  userId: string
) => {
  const response = await fetch(`${API_URL}/get-blog-posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit, offset, userId, isProfilePage: true }),
  });
  if (!response.ok) {
    throw new Error("Failed to get profile page blog post cards");
  }
  return response.json();
};

export const getBlogPostContent = async (id: string) => {
  const response = await fetch(`${API_URL}/get-blog-post/${id}`);
  if (!response.ok) {
    throw new Error("Failed to get blog post content");
  }
  return response.json();
};

export const checkAuth = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/check-auth`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });
  return !!response.ok;
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid email or password");
    }
    throw new Error("Login failed");
  }

  const data = await response.json();
  return data;
};

export const register = async (
  email: string,
  username: string,
  password: string
) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, username, password }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("User with this email or username already exists");
    }

    throw new Error("Registration failed");
  }

  const data = await response.json();
  return data;
};

export const createBlogPost = async (title: string, content: string) => {
  const user = await AsyncStorage.getItem("user");
  if (!user) {
    throw new Error("User not found");
  }
  const token = JSON.parse(user).token;
  const response = await fetch(`${API_URL}/blog-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    throw new Error("Failed to create blog post");
  }

  return response.json();
};

export const updateBlogPost = async (
  id: string,
  title: string,
  content: string
) => {
  const user = await AsyncStorage.getItem("user");
  if (!user) {
    throw new Error("User not found");
  }
  const token = JSON.parse(user).token;
  const response = await fetch(`${API_URL}/blog-post/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    throw new Error("Failed to update blog post");
  }

  return response.json();
};

export const deleteBlogPost = async (id: string) => {
  const user = await AsyncStorage.getItem("user");
  if (!user) {
    throw new Error("User not found");
  }
  const token = JSON.parse(user).token;
  const response = await fetch(`${API_URL}/blog-post/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete blog post");
  }

  return response.json();
};

export const createComment = async (postId: string, content: string) => {
  const user = await AsyncStorage.getItem("user");
  if (!user) {
    throw new Error("User not found");
  }
  const token = JSON.parse(user).token;
  const response = await fetch(`${API_URL}/blog-post/${postId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
};

export const deleteComment = async (postId: string, commentId: string) => {
  const user = await AsyncStorage.getItem("user");
  if (!user) {
    throw new Error("User not found");
  }
  const token = JSON.parse(user).token;
  const response = await fetch(
    `${API_URL}/blog-post/${postId}/comment/${commentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }

  return response.json();
};

export const getBlogPostComments = async (postId: string) => {
  const response = await fetch(`${API_URL}/blog-post/${postId}/get-comments`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("Failed to get blog post comments");
  }
  return response.json();
};
