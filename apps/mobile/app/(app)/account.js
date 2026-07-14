import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>F</Text>
        </View>
        <Text style={styles.name}>Faby</Text>
        <Text style={styles.email}>faby@scopework.com</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>Free</Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOut} onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { backgroundColor: '#151C24', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  body: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFA12B', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#1E2530' },
  name: { fontSize: 20, fontWeight: '800', color: '#1E2530' },
  email: { fontSize: 13, color: '#9AA0A8', marginTop: 4, marginBottom: 28 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E1E2E4', padding: 20, gap: 0, width: '100%', marginBottom: 24 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E2530' },
  statLabel: { fontSize: 11, color: '#9AA0A8', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E1E2E4' },
  signOut: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1E2E4', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  signOutText: { fontSize: 14, fontWeight: '700', color: '#6E737B' },
});
