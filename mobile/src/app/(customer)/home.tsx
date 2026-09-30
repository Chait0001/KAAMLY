// Placeholder customer home screen — will show nearby cycle shops later.
import { View, Text, StyleSheet } from "react-native";

export default function CustomerHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
