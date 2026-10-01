import { View, ActivityIndicator } from "react-native";

export default function Index() {
  // Routing is handled automatically by AuthContext in useEffect.
  // We just show a spinner while it decides where to go.
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
