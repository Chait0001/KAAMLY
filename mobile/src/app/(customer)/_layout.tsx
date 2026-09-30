// Layout for the (customer) route group.
// After login, customers are sent here. Later this will have tabs
// (home, bookings, profile, etc.).
import { Stack } from "expo-router";

export default function CustomerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
