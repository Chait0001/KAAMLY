// Placeholder mechanic jobs screen — will show incoming job requests later.
import { View, Text, StyleSheet } from "react-native";

export default function MechanicJobsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mechanic Jobs</Text>
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
