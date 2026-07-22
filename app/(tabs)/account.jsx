import { Alert, Text, TouchableOpacity, View } from "react-native";

import { supabase } from "../../lib/supabase";

export default function AccountScreen() {
  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          // Auth listener in root layout handles the redirect
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header */}
      <View className="bg-brand-dark px-5 pt-14 pb-5">
        <Text className="text-2xl font-bold text-white">Account</Text>
      </View>

      <View className="flex-1 px-4 pt-6 gap-3">
        {/* Sign out button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-white border border-brand-border rounded-xl px-4 py-4 flex-row items-center justify-between"
        >
          <Text className="text-base font-medium text-brand-danger">Sign Out</Text>
          <Text className="text-brand-muted">→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
