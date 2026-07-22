import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import { shadows } from "../../lib/shadow";
import { supabase } from "../../lib/supabase";

function Row({ icon, label, sublabel, onPress, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-4 bg-white rounded-2xl px-5 py-4 mb-2.5"
      style={shadows.sm}
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: danger ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)" }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View className="flex-1">
        <Text style={{ color: danger ? "#EF4444" : "#1A1F2E", fontSize: 15, fontWeight: "600" }}>{label}</Text>
        {sublabel ? <Text className="text-brand-muted text-xs mt-0.5">{sublabel}</Text> : null}
      </View>
      <Text className="text-brand-muted text-lg">›</Text>
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function handleSignOut() {
    Alert.alert("Sign Out", "You'll need to sign in again to access your projects.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => supabase.auth.signOut() },
    ]);
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Dark header */}
      <LinearGradient colors={["#1A1F2E", "#252C3D"]}
        style={{ paddingTop: 56, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View className="flex-row items-center gap-4">
          <LinearGradient colors={["#F59E0B", "#D97706"]}
            style={{ width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </LinearGradient>
          <View>
            <Text className="text-white text-xl font-bold">My Account</Text>
            {email ? <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 2 }}>{email}</Text> : null}
          </View>
        </View>
      </LinearGradient>

      <View className="px-4 pt-6">
        <Text className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3 ml-1">
          Account
        </Text>
        <Row icon="📧" label="Email" sublabel={email ?? "Loading…"} onPress={() => {}} />
        <Row icon="🔒" label="Change Password" sublabel="Update your password" onPress={() => {}} />

        <Text className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3 ml-1 mt-5">
          General
        </Text>
        <Row icon="❓" label="Help & Support" onPress={() => {}} />
        <Row icon="📜" label="Privacy Policy" onPress={() => {}} />

        <View className="mt-4">
          <Row icon="🚪" label="Sign Out" danger onPress={handleSignOut} />
        </View>
      </View>
    </View>
  );
}
