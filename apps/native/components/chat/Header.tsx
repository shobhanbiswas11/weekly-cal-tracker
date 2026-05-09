import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function Header() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <Text style={styles.title}>Calorie Coach</Text>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.doneButton}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  spacer: {
    width: 44,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  doneButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "500",
  },
}));
