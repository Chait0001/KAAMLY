// Root layout — the top-level wrapper for the entire app.
// Expo Router uses a file-based routing system (like Next.js).
// This _layout.tsx wraps every screen. <Stack> gives us a stack navigator
// (screens slide in from the right, with a back button).
import { Stack } from "expo-router";
import { AuthProvider } from "../store/AuthContext";
import { LocationProvider } from "../store/LocationContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Stack
          // screenOptions apply to every screen in this stack by default
          screenOptions={{ headerShown: false }}
        />
      </LocationProvider>
    </AuthProvider>
  );
}
