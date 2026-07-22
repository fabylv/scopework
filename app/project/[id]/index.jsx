import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import IssueRow from "../../../components/IssueRow";
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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: project, isLoading, refetch } = useProject(id);

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

  async function handleUpdateIssue(issueId, updates) {
    await updateIssue(issueId, updates);
    refetch();
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header */}
      <LinearGradient colors={["#1A1F2E", "#252C3D"]}
        style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text style={{ color: "#F59E0B", fontSize: 14, fontWeight: "600" }}>← Back</Text>
        </TouchableOpacity>
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
            <IssueRow issue={item} onUpdate={handleUpdateIssue} />
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
