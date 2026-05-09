import { Keyboard, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function EmptyState() {
  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✦</Text>
      </View>
      <Text style={styles.title}>How can I help you?</Text>
      <Text style={styles.subtitle}>
        Ask me about your calories, macros, or nutrition goals.
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  icon: {
    color: theme.colors.primaryForeground,
    fontSize: 28,
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    lineHeight: 22,
  },
}));
