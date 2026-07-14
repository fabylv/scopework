import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MOCK_CONTRACTORS } from '@scopework/shared';

export default function ContractorsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contractors</Text>
        <Text style={styles.headerSub}>Your saved contacts</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {MOCK_CONTRACTORS.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{c.name.split(' ').map(n => n[0]).join('')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.specialty}>{c.specialty} · {c.rate}</Text>
              <Text style={styles.phone}>{c.phone}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Contractor</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { backgroundColor: '#151C24', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#5A6270', marginTop: 2 },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E1E2E4', padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFA12B', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#1E2530' },
  name: { fontSize: 15, fontWeight: '700', color: '#1E2530' },
  specialty: { fontSize: 12, color: '#6E737B', marginTop: 2 },
  phone: { fontSize: 12, color: '#9AA0A8', marginTop: 2 },
  addBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#FFA12B', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#FFA12B' },
});
