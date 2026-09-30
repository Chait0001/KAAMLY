// App entry point — redirects to the login screen immediately.
// Redirect is an Expo Router component: when it renders, the user
// is sent to the target route without seeing this screen at all.
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
