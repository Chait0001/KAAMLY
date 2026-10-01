import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../store/AuthContext";

export default function CustomerHomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Home</Text>
      <Text style={styles.subtitle}>Welcome, {user?.name}</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
