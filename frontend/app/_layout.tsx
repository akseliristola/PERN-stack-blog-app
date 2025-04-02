import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AppProvider } from "@/contexts/appcontext";
import { BlogProvider } from "@/contexts/blogContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const queryClient = new QueryClient();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <BlogProvider>
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false, title: "Blog" }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </BlogProvider>
        </AppProvider>
        <Toast />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
