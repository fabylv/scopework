import { Redirect } from "expo-router";

// Root index — the auth guard in _layout.jsx will redirect
// to /(tabs)/dashboard if signed in, or /(auth)/login if not.
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
