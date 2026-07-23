import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomNav from "../../../components/BottomNav";
import HeaderLogo from "../../../components/HeaderLogo";
import IssueRow from "../../../components/IssueRow";
import { useDeletePhoto, usePhotos } from "../../../hooks/usePhotos";
import { useProject } from "../../../hooks/useProjects";
import { updateIssue } from "../../../lib/api/issues";

const CATEGORY_ICON = {
  Plumbing: "🔧", Electrical: "⚡", HVAC: "❄️", Structural: "🏗️",
  Roofing: "🏠", Flooring: "🪵", Painting: "🎨", Other: "📋",
};

function groupByCategory(issues = []) {
  const map = {};
  for (const issue of issues) {
    const cat = issue.category ?? "Other";
    if (!map[cat]) map[cat] = [];
    map[cat].push(issue);
  }
  return Object.entries(map).map(([title, data]) => ({ title, data }));
}

function CostSummary({ issues = [] }) {
  const total = issues.reduce((s, i) => s + (i.estimated_cost ?? 0), 0);
  const high   = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low    = issues.filter((i) => i.severity === "low").length;

  return (
    <LinearGradient
      colors={["#1A1F2E", "#252C3D"]}
      style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 24, padding: 20 }}
    >
      <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 }}>
        Estimated Total
      </Text>
      <Text style={{ color: "#F59E0B", fontSize: 36, fontWeight: "800", marginTop: 4 }}>
        ${total.toLocaleString()}
      </Text>

      {issues.length > 0 && (
        <View style={{ flexDirection: "row", gap: 12, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
          {[
            { label: "Critical", count: high,   color: "#EF4444" },
            { label: "Moderate", count: medium, color: "#F59E0B" },
            { label: "Minor",    count: low,    color: "#10B981" },
          ].map(({ label, count, color }) => (
            <View key={label} style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ color, fontSize: 20, fontWeight: "800" }}>{count}</Text>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </LinearGradient>
  );
}

export default function ProjectDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: project, isLoading, refetch } = useProject(id);
  const { data: photos = [], refetch: refetchPhotos } = usePhotos(id);
  const deletePhoto = useDeletePhoto(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-bg items-center justify-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 bg-brand-bg items-center justify-center px-6">
        <Text className="text-brand-muted text-base">Project not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-brand-amber font-semibold">← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = groupByCategory(project.issues);
  // Map photo id → photo for exact linking via photo_id
  const photosById = Object.fromEntries(photos.map((p) => [p.id, p]));
  // Fallback: sort photos oldest-first so we can pair them to issue batches by time
  const photosSorted = [...photos].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  function photoForIssue(issue) {
    // 1. Exact link via photo_id (works once SQL column exists + new photos captured)
    if (issue.photo_id && photosById[issue.photo_id]) return photosById[issue.photo_id];
    // 2. Fallback: nearest photo captured at or before this issue was created
    const issueTime = new Date(issue.created_at).getTime();
    let best = null;
    for (const p of photosSorted) {
      if (new Date(p.created_at).getTime() <= issueTime + 30000) best = p;
      else break;
    }
    return best ?? photosSorted[0] ?? null;
  }

  async function handleUpdateIssue(issueId, updates) {
    await updateIssue(issueId, updates);
    refetch();
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header */}
      <LinearGradient colors={["#1A1F2E", "#252C3D"]}
        style={{ paddingTop: insets.top + 12, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/dashboard")}>
            <Text style={{ color: "#F59E0B", fontSize: 14, fontWeight: "600" }}>← Back</Text>
          </TouchableOpacity>
          <HeaderLogo />
        </View>
        <Text className="text-white text-xl font-bold" numberOfLines={1}>{project.name}</Text>
        {project.address ? (
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 3 }}>📍 {project.address}</Text>
        ) : null}
      </LinearGradient>

      {/* Cost summary + capture CTA */}
      <CostSummary issues={project.issues} />

      <TouchableOpacity
        onPress={() => router.push(`/project/${id}/capture`)}
        activeOpacity={0.85}
        className="mx-4 mt-3"
      >
        <LinearGradient
          colors={["#F59E0B", "#D97706"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ borderRadius: 18, paddingVertical: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>📸  Add / Capture Photos</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Photo strip */}
      {photos.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginLeft: 20, marginBottom: 10 }}>
            Photos · {photos.length}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                onLongPress={() =>
                  Alert.alert("Delete Photo", "Remove this photo from the project?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deletePhoto(photo) },
                  ])
                }
                activeOpacity={0.85}
                style={{ width: 100, height: 100, borderRadius: 14, overflow: "hidden", backgroundColor: "#1A1F2E" }}
              >
                <Image
                  source={{ uri: photo.public_url }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Issues */}
      {sections.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 pb-20">
          <View className="w-20 h-20 rounded-3xl bg-brand-amber/10 border border-brand-amber/20 items-center justify-center">
            <Text style={{ fontSize: 36 }}>📋</Text>
          </View>
          <Text className="text-lg font-bold text-brand-dark">No issues yet</Text>
          <Text className="text-sm text-brand-muted text-center px-10 leading-5">
            Capture property photos and the AI will identify repair issues and estimate costs automatically.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48, paddingTop: 16 }}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 16, paddingBottom: 8, backgroundColor: "#F8F7F4" }}>
              <Text style={{ fontSize: 16 }}>{CATEGORY_ICON[title] ?? "📋"}</Text>
              <Text style={{ fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.2, color: "#64748B" }}>
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <IssueRow issue={item} photo={photoForIssue(item)} onUpdate={handleUpdateIssue} />
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNav />
    </View>
  );
}
