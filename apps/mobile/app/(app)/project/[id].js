import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MOCK_PROJECTS, estimateCostRange, formatCostRange } from '@scopework/shared';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const project = MOCK_PROJECTS.find((item) => item.id === id) || MOCK_PROJECTS[0];

  const totalLow = project.repairs.reduce((sum, repair) => sum + estimateCostRange(repair.severity)[0], 0);
  const totalHigh = project.repairs.reduce((sum, repair) => sum + estimateCostRange(repair.severity)[1], 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Project</Text>
        <View style={{ width: 52 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.address}>{project.address}</Text>
        <Text style={styles.notes}>{project.notes}</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Estimated Range</Text>
          <Text style={styles.summaryValue}>{formatCostRange(totalLow, totalHigh)}</Text>
        </View>
        <Text style={styles.section}>Repairs</Text>
        {project.repairs.map((repair) => (
          <View key={repair.id} style={styles.repairCard}>
            <Text style={styles.repairType}>{repair.type}</Text>
            <Text style={styles.repairMeta}>{repair.location} · {repair.trade}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { backgroundColor: '#151C24', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#FFA12B', fontWeight: '700', width: 52 },
  title: { color: '#fff', fontSize: 16, fontWeight: '800' },
  body: { padding: 20, gap: 12 },
  address: { fontSize: 22, fontWeight: '800', color: '#1E2530' },
  notes: { fontSize: 14, color: '#6E737B' },
  summary: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E1E2E4', padding: 16, marginTop: 8 },
  summaryLabel: { fontSize: 11, color: '#9AA0A8', textTransform: 'uppercase', letterSpacing: 1 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#1E2530', marginTop: 4 },
  section: { fontSize: 12, fontWeight: '800', color: '#9AA0A8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 },
  repairCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E1E2E4', padding: 14 },
  repairType: { fontSize: 15, fontWeight: '700', color: '#1E2530' },
  repairMeta: { fontSize: 12, color: '#6E737B', marginTop: 4 },
});
