import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  function handleRegister() {
    // TODO: real auth via @scopework/api-client
    router.replace('/(app)/dashboard');
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}><Text style={styles.logoEmoji}>🏗️</Text></View>
          <Text style={styles.logoText}>ScopeWork</Text>
        </View>
        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.sub}>Know exactly what repairs cost — before you commit</Text>
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#9AA0A8" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9AA0A8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9AA0A8" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={styles.btn} onPress={handleRegister}>
            <Text style={styles.btnText}>Create account →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' },
  logoBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFA12B', alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 20 },
  logoText: { fontSize: 22, fontWeight: '800', color: '#1E2530' },
  heading: { fontSize: 28, fontWeight: '800', color: '#1E2530', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#9AA0A8', textAlign: 'center', marginBottom: 32 },
  form: { gap: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1E2E4', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1E2530' },
  btn: { backgroundColor: '#FFA12B', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnText: { fontSize: 15, fontWeight: '800', color: '#1E2530' },
  linkRow: { alignItems: 'center', marginTop: 8 },
  link: { fontSize: 13, color: '#6E737B' },
});
