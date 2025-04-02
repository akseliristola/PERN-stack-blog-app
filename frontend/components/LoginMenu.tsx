import { ScrollView } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { LoginForm } from "./LoginForm";
import { StyleSheet } from "react-native";

const LoginScreen = () => {
  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Welcome
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Please log in or sign up to continue
        </ThemedText>
        <LoginForm />
      </ThemedView>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
    marginTop: 100,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  scrollView: {
    backgroundColor: "white",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },
});

export default LoginScreen;
