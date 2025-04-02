import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { login, register } from "@/utils/api";
import { useAppContext } from "@/contexts/appcontext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useBlogContext } from "@/contexts/blogContext";

const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

const validateUsername = (username: string): string | null => {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters long";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters long";
  return null;
};

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { setUser } = useAppContext();
  const { refetchHomePage, refetchProfilePage } = useBlogContext();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: async (data) => {
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      email,
      username,
      password,
    }: {
      email: string;
      username: string;
      password: string;
    }) => register(email, username, password),
    onSuccess: async (data) => {
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Your account has been created successfully",
        position: "bottom",
      });
      refetchHomePage();
      refetchProfilePage();
    },
  });

  const handleSubmit = async () => {
    let error = null;

    if (!isLogin) {
      error = validateUsername(username);
      if (error) {
        setValidationError(error);
        return;
      }
    }

    error = validateEmail(email);
    if (error) {
      setValidationError(error);
      return;
    }

    error = validatePassword(password);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, username, password });
    }
  };

  const toggleForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setIsLogin(!isLogin);
    setValidationError(null);
    loginMutation.reset();
    registerMutation.reset();
  };

  const error =
    validationError || (isLogin ? loginMutation.error : registerMutation.error);
  const isLoading = isLogin
    ? loginMutation.isPending
    : registerMutation.isPending;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inputContainer}>
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      {error ? (
        <ThemedText style={styles.error}>
          {error instanceof Error ? error.message : error}
        </ThemedText>
      ) : null}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <ThemedText style={styles.buttonText}>
          {isLoading
            ? isLogin
              ? "Logging in..."
              : "Creating account..."
            : isLogin
            ? "Login"
            : "Sign up"}
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleForm} style={styles.toggleButton}>
        <ThemedText style={styles.toggleText}>
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0a7ea4",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#ff4444",
    fontSize: 14,
  },
  toggleButton: {
    alignItems: "center",
    padding: 8,
  },
  toggleText: {
    color: "#0a7ea4",
    fontSize: 14,
  },
});
