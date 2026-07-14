import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { MOCK_PROJECTS, estimateCostRange } from '@scopework/shared';

function StatusBadge({ status }) {
  const map = {
    estimate_ready: { bg: '#DCFCE7', text: '#15803D', label: 'Estimate Ready' },
    in_progress: { bg: '#FFF3DE', text: '#8A6400', label: 'In Progress' },
    draft: { bg: '#F1F2F3', text: '#6E737B', label: 'Draft' },
  };
  const s = map[status] || map.draft;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

function ProjectCard({ project, onPress }) {
  const totalLow = project.repairs.reduce((a, r) => a + estimateCostRange(r.severity)[0], 0);
  const totalHigh = project.repairs.reduce((a, r) => a + estimateCostRange(r.severity)[1], 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardGradient} />
      <View style={styles.cardBody}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={styles.cardAddress} numberOfLines={2}>{project.address}</Text>
          <StatusBadge status={project.status} />
        </View>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>Estimated</Text>
            {project.repairs.length > 0
              ? <Text style={styles.cardCost}>${totalLow.toLocaleString()} – ${totalHigh.toLocaleString()}</Text>
              : <Text style={[styles.cardCost, { color: '#B0B6BE' }]}>—</Text>
            }
          </View>
          <Text style={styles.cardPhotos}>{project.photos.length} photos · {project.repairs.length} issues</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const projects = MOCK_PROJECTS; // TODO: replace with API call

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Projects</Text>
          <Text style={styles.headerSub}>{projects.length} active properties</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(app)/new-project')}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA12B" />}
      >
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onPress={() => router.push(`/(app)/project/${p.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { backgroundColor: '#151C24', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#5A6270', marginTop: 2 },
  newBtn: { backgroundColor: '#FFA12B', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  newBtnText: { fontSize: 13, fontWeight: '800', color: '#1E2530' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E1E2E4', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardGradient: { height: 6, backgroundColor: '#FFA12B' },
  cardBody: { padding: 14 },
  cardAddress: { fontSize: 15, fontWeight: '700', color: '#1E2530', flex: 1, marginRight: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#9AA0A8', textTransform: 'uppercase', letterSpacing: 1 },
  cardCost: { fontSize: 16, fontWeight: '800', color: '#1E2530', marginTop: 2 },
  cardPhotos: { fontSize: 11, color: '#9AA0A8' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '700' },
});
