import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const MODEL_OPTIONS = [
  { id: 'openai', label: 'GPT-4o', desc: 'Fast & precise' },
  { id: 'anthropic', label: 'Claude', desc: 'Detailed analysis' },
  { id: 'google', label: 'Gemini', desc: 'Great for photos' },
];

export default function NewProjectScreen() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [model, setModel] = useState('openai');
  const [saving, setSaving] = useState(false);

  function handleCreate() {
    if (!address.trim()) return;
    setSaving(true);
    // TODO: call API to create project
    setTimeout(() => {
      router.push('/(app)/dashboard');
    }, 800);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={styles.topTitle}>New Inspection</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.sectionLabel}>Property Address</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Main St, Tampa, FL"
          placeholderTextColor="#9AA0A8"
          value={address}
          onChangeText={setAddress}
        />
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="e.g. 3BR/2BA rental, built 1978, vacant"
          placeholderTextColor="#9AA0A8"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>AI Model</Text>
        <View style={styles.modelRow}>
          {MODEL_OPTIONS.map((opt) => {
            const active = model === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.modelBtn, active && styles.modelBtnActive]}
                onPress={() => setModel(opt.id)}
              >
                <Text style={[styles.modelLabel, active && styles.modelLabelActive]}>{opt.label}</Text>
                <Text style={[styles.modelDesc, active && styles.modelDescActive]}>{opt.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          style={[styles.createBtn, !address.trim() && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={saving || !address.trim()}
        >
          <Text style={styles.createBtnText}>{saving ? 'Creating...' : 'Start Inspection →'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#151C24' },
  backBtn: { fontSize: 13, color: '#FFA12B', fontWeight: '700', width: 60 },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  form: { padding: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9AA0A8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1E2E4', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, color: '#1E2530' },
  modelRow: { flexDirection: 'row', gap: 10 },
  modelBtn: { flex: 1, borderWidth: 2, borderColor: '#E1E2E4', borderRadius: 10, padding: 12, backgroundColor: '#FAF9F6' },
  modelBtnActive: { borderColor: '#FFA12B', backgroundColor: '#FFF3DE' },
  modelLabel: { fontSize: 13, fontWeight: '700', color: '#4A5260' },
  modelLabelActive: { color: '#1E2530' },
  modelDesc: { fontSize: 11, color: '#9AA0A8', marginTop: 2 },
  modelDescActive: { color: '#8A6400' },
  createBtn: { backgroundColor: '#FFA12B', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { fontSize: 15, fontWeight: '800', color: '#1E2530' },
});
