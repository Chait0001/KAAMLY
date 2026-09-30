// Layout for the (mechanic) route group.
// After login, mechanics are sent here. Later this will have tabs
// (jobs, earnings, profile, etc.).
import { Stack } from "expo-router";

export default function MechanicLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
