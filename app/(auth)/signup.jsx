import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../../lib/supabase";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  async function handleSignup() {
    setError(null);
    if (!email.trim()) { setError("Email is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  }

  const inputStyle = (field) => [
    "bg-white/10 border rounded-2xl px-4 py-4 text-white text-base",
    focusedField === field ? "border-brand-amber" : "border-white/20",
  ].join(" ");

  if (success) {
    return (
      <LinearGradient colors={["#1A1F2E", "#12161F", "#1A1F2E"]} style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-3xl bg-brand-success/20 border border-brand-success/40 items-center justify-center mb-6">
            <Text style={{ fontSize: 44 }}>✉️</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-3">Check your inbox</Text>
          <Text className="text-white/50 text-base text-center leading-6 mb-8">
            We sent a confirmation link to{"\n"}
            <Text className="text-brand-amber font-semibold">{email}</Text>
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")} activeOpacity={0.85}>
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Back to Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1A1F2E", "#12161F", "#1A1F2E"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-brand-amber items-center justify-center mb-4">
              <Text style={{ fontSize: 28 }}>🔍</Text>
            </View>
            <Text className="text-white text-3xl font-bold">Create account</Text>
            <Text className="text-white/40 text-sm mt-1">Start estimating repairs in minutes</Text>
          </View>

          {/* Form card */}
          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
          >
            <View className="px-6 py-7 gap-4">
              {[
                { key: "email", label: "Email", placeholder: "you@example.com", value: email, set: setEmail, keyboard: "email-address", secure: false, auto: "email" },
                { key: "password", label: "Password", placeholder: "Min. 8 characters", value: password, set: setPassword, keyboard: "default", secure: true, auto: "new-password" },
                { key: "confirm", label: "Confirm Password", placeholder: "Re-enter password", value: confirm, set: setConfirm, keyboard: "default", secure: true, auto: "new-password" },
              ].map(({ key, label, placeholder, value, set, keyboard, secure, auto }) => (
                <View key={key} className="gap-1.5">
                  <Text className="text-white/60 text-xs font-medium uppercase tracking-wider">{label}</Text>
                  <TextInput
                    value={value}
                    onChangeText={set}
                    placeholder={placeholder}
                    keyboardType={keyboard}
                    autoCapitalize="none"
                    autoComplete={auto}
                    secureTextEntry={secure}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    onFocus={() => setFocusedField(key)}
                    onBlur={() => setFocusedField(null)}
                    className={inputStyle(key)}
                  />
                </View>
              ))}

              {error ? (
                <View className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3">
                  <Text className="text-red-300 text-sm">{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.85} className="mt-1">
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Create Account →</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-white/40 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text className="text-brand-amber text-sm font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
