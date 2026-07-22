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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup() {
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-brand-bg items-center justify-center px-6">
        <Text className="text-2xl font-bold text-brand-dark mb-3">
          Check your email ✉️
        </Text>
        <Text className="text-base text-brand-muted text-center mb-8">
          We sent a confirmation link to{" "}
          <Text className="font-semibold text-brand-dark">{email}</Text>. Click
          it to activate your account.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          className="bg-brand-amber rounded-xl py-3 px-8"
        >
          <Text className="text-white font-semibold text-base">Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-brand-dark">Create account</Text>
          <Text className="text-base text-brand-muted mt-1">
            Start estimating repairs in minutes
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-brand-dark mb-1.5">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-white border border-brand-border rounded-xl px-4 py-3 text-base text-brand-dark"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-brand-dark mb-1.5">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 characters"
              secureTextEntry
              autoComplete="new-password"
              className="bg-white border border-brand-border rounded-xl px-4 py-3 text-base text-brand-dark"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-brand-dark mb-1.5">
              Confirm Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry
              autoComplete="new-password"
              className="bg-white border border-brand-border rounded-xl px-4 py-3 text-base text-brand-dark"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <Text className="text-sm text-brand-danger">{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="bg-brand-amber rounded-xl py-4 items-center mt-2"
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-sm text-brand-muted">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-sm font-semibold text-brand-amber">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
