// Layout for the (auth) route group.
// A "route group" (folder name in parentheses) groups related screens
// without adding a segment to the URL. So "(auth)/login" navigates
// as just "/login" at runtime.
import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
